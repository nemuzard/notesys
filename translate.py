# -*- coding: utf-8 -*-
import os
import re
import time
import json
from typing import Dict, List, Tuple

import pymysql
import requests
from dotenv import load_dotenv
from pathlib import Path

# ===================== 环境与配置 =====================

load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

def getenv_bool(k: str, default: bool) -> bool:
    v = os.getenv(k, str(int(default))).strip().lower()
    return v in ("1", "true", "yes", "y", "on")

CFG_DB_BASE = {
    "host": os.getenv("MYSQL_HOST", "127.0.0.1"),
    "port": int(os.getenv("MYSQL_PORT", "3306")),
    "database": os.getenv("MYSQL_DB"),
    "user": os.getenv("MYSQL_USER"),
    "charset": "utf8mb4",
    "cursorclass": pymysql.cursors.DictCursor,
    "autocommit": False,
}

BATCH_SIZE = int(os.getenv("BATCH_SIZE", "200"))
SLEEP_BASE = float(os.getenv("SLEEP_BASE_SECONDS", "0.08"))
LOCK_WAIT_TIMEOUT = int(os.getenv("LOCK_WAIT_TIMEOUT", "5"))
INNODB_LOCK_WAIT_TIMEOUT = int(os.getenv("INNODB_LOCK_WAIT_TIMEOUT", "5"))

TRANSLATOR_PROVIDER = os.getenv("TRANSLATOR_PROVIDER", "azure").lower()
AZ_KEY    = os.getenv("AZURE_TRANSLATOR_KEY", "").strip()
AZ_REGION = os.getenv("AZURE_TRANSLATOR_REGION", "").strip()
AZ_EP     = os.getenv("AZURE_TRANSLATOR_ENDPOINT", "https://api.cognitive.microsofttranslator.com").rstrip("/")

# 控制项
ONLY_TABLES = set(x.strip() for x in os.getenv("ONLY_TABLES", "").split(",") if x.strip())
DRY_RUN = getenv_bool("DRY_RUN", False)
WIDEN_EN_COLUMNS = getenv_bool("WIDEN_EN_COLUMNS", True)

# 建议默认不走代理；必要时在此填入 proxies
PROXIES = None

def build_db_cfg() -> Dict:
    cfg = CFG_DB_BASE.copy()
    pw = os.getenv("MYSQL_PASSWORD", "")
    if pw:
        cfg["password"] = pw
    return cfg

# ===================== 规则与检测 =====================

CN_RE          = re.compile(r"[\u3400-\u9FFF\uF900-\uFAFF]")  # 中日韩统一表意 + 兼容区
URL_RE         = re.compile(r"^(?:https?|ftp)://", re.I)
EMAIL_RE       = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
IS_NUMERIC_RE  = re.compile(r"^\s*[\d\.\-]+\s*$")

# 跳过关键词（小写匹配）
SKIP_COL_KEYWORDS = (
    "password", "pwd", "salt", "token", "sign", "signature", "sig",
    "email", "mail",
    "url", "uri", "link", "avatar", "image", "icon",
    "phone", "mobile", "tel",
    "idcard", "id_card", "id_no", "idnumber",
    "openid", "unionid", "session_key",
    "ip", "ua", "useragent", "user_agent",
    "hash", "checksum",
)

SKIP_TABLES: set = set()  # 如需排除某些表，在这里填名字
TEXT_TYPES = ('char', 'varchar', 'tinytext', 'text', 'mediumtext', 'longtext')

# 运行期翻译缓存（相同中文只翻一次）
_TRANSL_CACHE: Dict[str, str] = {}

def contains_chinese(s: str) -> bool:
    return isinstance(s, str) and bool(CN_RE.search(s))

def looks_like_non_language_value(s: str) -> bool:
    if not isinstance(s, str):
        return True
    t = s.strip()
    if not t or len(t) <= 1:
        return True
    if URL_RE.match(t) or EMAIL_RE.match(t) or IS_NUMERIC_RE.match(t):
        return True
    if t.startswith(("{", "[", "<", "<?xml", "function", "class", "import ", "package ")):
        return True
    return False

def should_translate_col(col_name: str) -> bool:
    n = col_name.lower()
    if n.endswith("_en"):
        return False
    return not any(k in n for k in SKIP_COL_KEYWORDS)

# ===================== Azure 翻译 =====================

def translate_azure(text: str) -> str:
    if not text:
        return text
    if text in _TRANSL_CACHE:
        return _TRANSL_CACHE[text]

    url = f"{AZ_EP}/translate"
    params = {"api-version": "3.0", "from": "zh-Hans", "to": "en", "textType": "plain"}
    headers = {
        "Ocp-Apim-Subscription-Key": AZ_KEY,
        "Ocp-Apim-Subscription-Region": AZ_REGION,
        "Content-Type": "application/json; charset=utf-8",
    }
    payload = [{"Text": text}]

    backoff = 0.8
    for _ in range(5):
        try:
            r = requests.post(url, params=params, headers=headers,
                              data=json.dumps(payload), timeout=20, proxies=PROXIES)
        except requests.RequestException:
            time.sleep(backoff); backoff *= 1.6
            continue

        if r.status_code in (200, 201):
            try:
                data = r.json()
                out = data[0]["translations"][0]["text"]
                _TRANSL_CACHE[text] = out
                return out
            except Exception:
                return text

        if r.status_code in (429, 500, 502, 503, 504):
            time.sleep(backoff); backoff *= 1.6
            continue

        # 配置/权限问题（401/403等），不抛异常，返回原文
        return text

    return text

def translate(text: str) -> str:
    return translate_azure(text)

# ===================== 元数据/DDL =====================

def get_text_columns(cur) -> List[Dict]:
    cur.execute(f"""
        SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA=%s
          AND DATA_TYPE IN ({",".join(["%s"]*len(TEXT_TYPES))})
        ORDER BY TABLE_NAME, ORDINAL_POSITION
    """, (CFG_DB_BASE["database"], *TEXT_TYPES))
    return cur.fetchall()

def ensure_en_columns(cur, cols: List[Dict]) -> int:
    """
    为需要翻译的列新增 `{col}_en`；统一建为 TEXT（utf8mb4），避免 1406。
    已存在则跳过。
    """
    added = 0
    for c in cols:
        table, col = c["TABLE_NAME"], c["COLUMN_NAME"]
        if table in SKIP_TABLES or not should_translate_col(col):
            continue
        if ONLY_TABLES and table not in ONLY_TABLES:
            continue

        # 已存在则跳过
        cur.execute("""
            SELECT 1 FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA=%s AND TABLE_NAME=%s AND COLUMN_NAME=%s
        """, (CFG_DB_BASE["database"], table, f"{col}_en"))
        if cur.fetchone():
            continue

        sql = f"""ALTER TABLE `{table}`
                  ADD COLUMN `{col}_en` TEXT
                  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL"""
        if DRY_RUN:
            print(f"[DRY] {sql}")
        else:
            cur.execute(sql)
        added += 1
        print(f"[ADD] {table}.{col}_en -> TEXT")
    return added

def widen_existing_en_columns_to_text(cur) -> int:
    """
    将所有 *_en 且类型为 CHAR/VARCHAR/TINYTEXT 的列统一放大为 TEXT（utf8mb4）；
    已是 TEXT/MEDIUMTEXT/LONGTEXT 的不动。
    """
    cur.execute("""
        SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA=%s
          AND COLUMN_NAME REGEXP '_en$'
          AND DATA_TYPE IN ('char','varchar','tinytext')
    """, (CFG_DB_BASE["database"],))
    rows = cur.fetchall()
    changed = 0
    for r in rows:
        table, col, dtype = r["TABLE_NAME"], r["COLUMN_NAME"], r["DATA_TYPE"]
        if ONLY_TABLES and table not in ONLY_TABLES:
            continue
        sql = f"""ALTER TABLE `{table}`
                  MODIFY `{col}` TEXT
                  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL"""
        if DRY_RUN:
            print(f"[DRY] {sql}")
        else:
            cur.execute(sql)
        changed += 1
        print(f"[WIDEN] {table}.{col} {dtype} -> TEXT")
    return changed

def get_primary_keys(cur, table: str) -> List[str]:
    cur.execute("""
        SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA=%s AND TABLE_NAME=%s AND CONSTRAINT_NAME='PRIMARY'
        ORDER BY ORDINAL_POSITION
    """, (CFG_DB_BASE["database"], table))
    return [x["COLUMN_NAME"] for x in cur.fetchall()]

# ===================== 主流程 =====================

def process_table_column(conn, cur, table: str, col: str, pk_cols: List[str]) -> Tuple[int, int]:
    """
    针对单个表列，分批扫描并填充 *_en。
    返回：(更新总数, 扫描行数)
    """
    offset = 0
    total_updates = 0
    scanned = 0

    while True:
        cur.execute(f"SELECT * FROM `{table}` LIMIT %s OFFSET %s", (BATCH_SIZE, offset))
        rows = cur.fetchall()
        if not rows:
            break

        updates = []
        for r in rows:
            scanned += 1
            val = r.get(col)

            # bytes → str
            if isinstance(val, (bytes, bytearray)):
                try:
                    val = val.decode("utf-8", errors="ignore")
                except Exception:
                    continue

            if not isinstance(val, str):
                continue
            if looks_like_non_language_value(val):
                continue
            if not contains_chinese(val):
                continue
            if r.get(f"{col}_en"):
                continue  # 幂等：只填空的

            en = translate(val)
            if not isinstance(en, str) or en == val:
                print(f"[WARN] translate failed or unchanged: {table}.{col} -> (pk={{{', '.join(f'{k}={r.get(k)!r}' for k in pk_cols)}}})")
                continue

            where = " AND ".join([f"`{k}`=%s" for k in pk_cols])
            params = [en] + [r[k] for k in pk_cols]
            updates.append((f"UPDATE `{table}` SET `{col}_en`=%s WHERE {where}", params))

        if updates:
            if DRY_RUN:
                for sql, params in updates[:3]:
                    print(f"[DRY][UPD] {table}.{col}_en sample -> {sql} {params[:2]} ...")
            else:
                for sql, params in updates:
                    cur.execute(sql, params)
                conn.commit()
            total_updates += len(updates)
            print(f"[UPD] {table}.{col}_en +{len(updates)} (offset={offset})")

        offset += BATCH_SIZE
        time.sleep(SLEEP_BASE)

    return total_updates, scanned

def main():
    # 基础校验：不再“干跑”
    if not CFG_DB_BASE["database"]:
        raise SystemExit("未设置 MYSQL_DB（.env）。")
    if TRANSLATOR_PROVIDER != "azure":
        raise SystemExit("TRANSLATOR_PROVIDER 必须为 azure。")
    if not (AZ_KEY and AZ_REGION and AZ_EP):
        raise SystemExit("未配置 Azure KEY/REGION/ENDPOINT，请在 .env 中设置 AZURE_TRANSLATOR_*。")

    # 避免无效代理干扰（如确需代理，自行删除下面两行）
    os.environ.pop("HTTP_PROXY", None); os.environ.pop("HTTPS_PROXY", None)

    conn = pymysql.connect(**build_db_cfg())
    try:
        with conn.cursor() as cur:
            # 降低锁等待，别再卡死
            cur.execute("SET SESSION lock_wait_timeout=%s", (LOCK_WAIT_TIMEOUT,))
            cur.execute("SET SESSION innodb_lock_wait_timeout=%s", (INNODB_LOCK_WAIT_TIMEOUT,))

            # 1) 收集文本列
            cols = get_text_columns(cur)

            # 2) 新增 *_en = TEXT
            _ = ensure_en_columns(cur, cols)

            # 3) 现有 *_en 如是 char/varchar/tinytext，统一放大为 TEXT（可关）
            if WIDEN_EN_COLUMNS:
                _ = widen_existing_en_columns_to_text(cur)

            if not DRY_RUN:
                conn.commit()

            # 4) 主键缓存
            pk_cache: Dict[str, List[str]] = {}

            # 5) 遍历需要翻译的列
            targets = [c for c in cols
                       if (c["TABLE_NAME"] not in SKIP_TABLES)
                       and should_translate_col(c["COLUMN_NAME"])
                       and not c["COLUMN_NAME"].endswith("_en")]
            if ONLY_TABLES:
                targets = [c for c in targets if c["TABLE_NAME"] in ONLY_TABLES]

            for c in targets:
                table, col = c["TABLE_NAME"], c["COLUMN_NAME"]

                # 无主键 → 跳过
                if table not in pk_cache:
                    pk_cache[table] = get_primary_keys(cur, table)
                pk_cols = pk_cache[table]
                if not pk_cols:
                    print(f"[SKIP] {table} 无主键，跳过列 {col}")
                    continue

                updated, scanned = process_table_column(conn, cur, table, col, pk_cols)
                if updated == 0:
                    print(f"[OK ] {table}.{col}_en 无需更新（扫描 {scanned} 行）")

        print("DONE.")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
