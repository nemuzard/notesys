package com.kama.notes.service.impl;

import com.kama.notes.mapper.CategoryMapper;
import com.kama.notes.mapper.NoteMapper;
import com.kama.notes.mapper.QuestionMapper;
import com.kama.notes.model.base.ApiResponse;
import com.kama.notes.model.base.EmptyVO;
import com.kama.notes.model.base.Pagination;
import com.kama.notes.model.dto.question.*;
import com.kama.notes.model.entity.Category;
import com.kama.notes.model.entity.Note;
import com.kama.notes.model.entity.Question;
import com.kama.notes.model.vo.question.CreateQuestionVO;
import com.kama.notes.model.vo.question.QuestionNoteVO;
import com.kama.notes.model.vo.question.QuestionUserVO;
import com.kama.notes.model.vo.question.QuestionVO;
import com.kama.notes.scope.RequestScopeData;
import com.kama.notes.service.CategoryService;
import com.kama.notes.service.QuestionService;
import com.kama.notes.utils.ApiResponseUtil;
import com.kama.notes.utils.MarkdownAST;
import com.kama.notes.utils.PaginationUtils;
import com.vladsch.flexmark.ast.BulletList;
import com.vladsch.flexmark.ast.Heading;
import com.vladsch.flexmark.ast.ListItem;
import com.vladsch.flexmark.ast.OrderedList;
import com.vladsch.flexmark.util.ast.Document;
import com.vladsch.flexmark.util.ast.Node;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class QuestionServiceImpl implements QuestionService {

    @Autowired
    private QuestionMapper questionMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private RequestScopeData requestScopeData;

    @Autowired
    private NoteMapper noteMapper;

    @Autowired
    private CategoryService categoryService;

    // -------------------------------
    // 正则：匹配形如：
    //   (考点: XXX) 或 （考点：XXX）
    private static final Pattern POINT_PATTERN =
            Pattern.compile("[（(]考点\\s*[：:]\\s*(.*?)[)）]");
    // 正则：匹配形如：
    //   【简单】、【中等】、【困难】
    private static final Pattern LEVEL_PATTERN =
            Pattern.compile("【(.*?)】");
    // -------------------------------

    @Override
    public Question findById(Integer questionId) {
        return questionMapper.findById(questionId);
    }

    @Override
    public Map<Integer, Question> getQuestionMapByIds(List<Integer> questionIds) {

        // 处理空数组的情况
        if (questionIds.isEmpty()) return Collections.emptyMap();

        List<Question> questions = questionMapper.findByIdBatch(questionIds);
        return questions.stream().collect(Collectors.toMap(Question::getQuestionId, question -> question));
    }

    @Override
    public ApiResponse<List<QuestionVO>> getQuestions(QuestionQueryParam queryParams) {

        int offset = PaginationUtils.calculateOffset(queryParams.getPage(), queryParams.getPageSize());
        int total = questionMapper.countByQueryParam(queryParams);

        Pagination pagination = new Pagination(queryParams.getPage(), queryParams.getPageSize(), total);
        List<Question> questions = questionMapper.findByQueryParam(queryParams, offset, queryParams.getPageSize());

        List<QuestionVO> questionVOs = questions.stream().map(question -> {
            QuestionVO questionVO = new QuestionVO();
            BeanUtils.copyProperties(question, questionVO);
            return questionVO;
        }).toList();

        return ApiResponseUtil.success("获取问题列表成功", questionVOs, pagination);
    }

    @Override
    public ApiResponse<CreateQuestionVO> createQuestion(CreateQuestionBody createQuestionBody) {

        // 校验分类 Id 是否合法
        Category category = categoryMapper.findById(createQuestionBody.getCategoryId());
        if (category == null) {
            return ApiResponseUtil.error("分类 Id 非法");
        }

        Question question = new Question();
        BeanUtils.copyProperties(createQuestionBody, question);

        try {
            questionMapper.insert(question);
            CreateQuestionVO createQuestionVO = new CreateQuestionVO();
            createQuestionVO.setQuestionId(question.getQuestionId());
            return ApiResponseUtil.success("创建问题成功", createQuestionVO);
        } catch (Exception e) {
            return ApiResponseUtil.error("创建问题失败");
        }
    }

    /**
     * 批量创建问题
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public ApiResponse<EmptyVO> createQuestionBatch(CreateQuestionBatchBody createQuestionBatchBody) {
        // 获取 markdown 文本
        String markdown = createQuestionBatchBody.getMarkdown();

        MarkdownAST markdownAST = new MarkdownAST(markdown);
        Document document = markdownAST.getMarkdownAST();

        // 遍历节点
        for (Node child = document.getFirstChild(); child != null; child = child.getNext()) {
            if (child instanceof Heading parentHeading) {  // 查询到 heading 节点
                if (parentHeading.getLevel() == 1) {  // 如果是一级标题
                    // 查看是否存在对应的一级标题分类
                    String parentCategoryName = markdownAST.getHeadingText(parentHeading);
                    Category parentCategory = categoryService.findOrCreateCategory(parentCategoryName);

                    Node childCategory = parentHeading.getNext();

                    for (; childCategory != null; childCategory = childCategory.getNext()) {
                        // 碰到下一个父分类 (Heading level=1)，跳出当前循环
                        if (childCategory instanceof Heading nextParent) {
                            if (nextParent.getLevel() == 1) {
                                break;
                            }
                        }

                        // 如果是二级标题（子分类 Heading level = 2）
                        if (childCategory instanceof Heading subHeading) {
                            if (subHeading.getLevel() == 2) {
                                String subCategoryName = markdownAST.getHeadingText(subHeading);

                                Category subCategory = categoryService.findOrCreateCategory(
                                        subCategoryName,
                                        parentCategory.getCategoryId()
                                );

                                Node listBlockNode = subHeading.getNext();
                                if (!(listBlockNode instanceof BulletList) &&
                                        !(listBlockNode instanceof OrderedList)) {
                                    // 没有找到列表，则抛错也好，或者直接跳过
                                    continue;
                                }

                                for (Node listItem = listBlockNode.getFirstChild();
                                     listItem != null;
                                     listItem = listItem.getNext()) {

                                    if (listItem instanceof ListItem listItem2) {
                                        String listItemText = markdownAST.getListItemText(listItem2);

                                        // 解析考点
                                        String examPoint = "";
                                        Matcher matchPoint = POINT_PATTERN.matcher(listItemText);
                                        if (!matchPoint.find()) {
                                            throw new RuntimeException("解析考点失败");
                                        }
                                        examPoint = matchPoint.group(1);

                                        // 解析难度
                                        String difficultyStr = "";
                                        Matcher matchLevel = LEVEL_PATTERN.matcher(listItemText);
                                        if (!matchLevel.find()) {
                                            throw new RuntimeException("解析难度失败");
                                        }
                                        difficultyStr = matchLevel.group(1);

                                        // 解析题目
                                        String title = listItemText
                                                .replaceAll(POINT_PATTERN.pattern(), "")
                                                .replaceAll(LEVEL_PATTERN.pattern(), "")
                                                .trim();

                                        // 查看题目是否存在
                                        Question question = questionMapper.findByTitle(title);

                                        if (question != null) {
                                            throw new RuntimeException("题目已存在");
                                        }

                                        // 难度映射表
                                        Map<String, Integer> difficultyMap = new HashMap<>();
                                        difficultyMap.put("简单", 1);
                                        difficultyMap.put("中等", 2);
                                        difficultyMap.put("困难", 3);

                                        Integer difficultyVal = difficultyMap.get(difficultyStr);
                                        if (difficultyVal == null) {
                                            throw new RuntimeException("难度解析失败");
                                        }

                                        // 创建问题
                                        Question addQuestion = new Question();

                                        addQuestion.setTitle(title);
                                        addQuestion.setCategoryId(subCategory.getCategoryId());
                                        addQuestion.setExamPoint(examPoint);
                                        addQuestion.setDifficulty(difficultyVal);

                                        try {
                                            questionMapper.insert(addQuestion);
                                        } catch (Exception e) {
                                            throw new RuntimeException("创建问题失败: " + e.getMessage());
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return ApiResponseUtil.success("创建问题成功");
    }

    @Override
    public ApiResponse<EmptyVO> updateQuestion(Integer questionId, UpdateQuestionBody updateQuestionBody) {
        Question question = new Question();
        BeanUtils.copyProperties(updateQuestionBody, question);
        question.setQuestionId(questionId);
        // 更新问题
        try {
            questionMapper.update(question);
            return ApiResponseUtil.success("更新问题成功");
        } catch (Exception e) {
            return ApiResponseUtil.error("更新问题失败");
        }
    }

    @Override
    public ApiResponse<EmptyVO> deleteQuestion(Integer questionId) {
        if (questionMapper.deleteById(questionId) > 0) {
            return ApiResponseUtil.success("删除问题成功");
        } else {
            return ApiResponseUtil.error("删除问题失败");
        }
    }

    // 同样是获取笔记列表，userGetQuestions 会携带用户是否完成该道题目的信息
    @Override
    public ApiResponse<List<QuestionUserVO>> userGetQuestions(QuestionQueryParam queryParams) {

        // 分页相关信息
        int offset = PaginationUtils.calculateOffset(queryParams.getPage(), queryParams.getPageSize());
        int total = questionMapper.countByQueryParam(queryParams);
        Pagination pagination = new Pagination(queryParams.getPage(), queryParams.getPageSize(), total);

        // 根据 queryParams 查询出符合条件的问题列表
        List<Question> questions = questionMapper.findByQueryParam(queryParams, offset, queryParams.getPageSize());

        // 提取出 questionId
        List<Integer> questionIds = questions.stream().map(Question::getQuestionId).toList();

        // 存放用户完成的题目 Id 集合
        Set<Integer> userFinishedQuestionIds;

        // 如果是登录状态，则查询出当前用户完成的题目 Id 集合
        if (requestScopeData.isLogin() && requestScopeData.getUserId() != null) {
            userFinishedQuestionIds = noteMapper.filterFinishedQuestionIdsByUser(requestScopeData.getUserId(), questionIds);
        } else {
            userFinishedQuestionIds = Collections.emptySet();
        }

        List<QuestionUserVO> questionUserVOs = questions.stream().map(question -> {
            QuestionUserVO questionUserVO = new QuestionUserVO();
            QuestionUserVO.UserQuestionStatus userQuestionStatus = new QuestionUserVO.UserQuestionStatus();

            // 判断用户是否完成该道题目
            if (userFinishedQuestionIds != null && userFinishedQuestionIds.contains(question.getQuestionId())) {
                userQuestionStatus.setFinished(true);  // 用户完成了该道题目
            }

            BeanUtils.copyProperties(question, questionUserVO);

            // 设置用户完成状态
            questionUserVO.setUserQuestionStatus(userQuestionStatus);
            return questionUserVO;
        }).toList();

        return ApiResponseUtil.success("获取用户问题列表成功", questionUserVOs, pagination);
    }

    @Override
    public ApiResponse<QuestionNoteVO> userGetQuestion(Integer questionId) {

        // 验证 question 是否存在
        Question question = questionMapper.findById(questionId);
        if (question == null) {
            return ApiResponseUtil.error("questionId 非法");
        }

        QuestionNoteVO questionNoteVO = new QuestionNoteVO();
        QuestionNoteVO.UserNote userNote = new QuestionNoteVO.UserNote();

        // 如果是登录状态，则查询出当前用户笔记
        if (requestScopeData.isLogin() && requestScopeData.getUserId() != null) {
            Note note = noteMapper.findByAuthorIdAndQuestionId(requestScopeData.getUserId(), questionId);
            if (note != null) {
                userNote.setFinished(true);
                BeanUtils.copyProperties(note, userNote);
            }
        }

        BeanUtils.copyProperties(question, questionNoteVO);
        questionNoteVO.setUserNote(userNote);

        // 增加问题的点击量
        // TODO: 有待优化
        questionMapper.incrementViewCount(questionId);

        return ApiResponseUtil.success("获取问题成功", questionNoteVO);
    }

    @Override
    public ApiResponse<List<QuestionVO>> searchQuestions(SearchQuestionBody body) {
        String keyword = body.getKeyword();

        // TODO: 简单实现搜索问题功能，后续需要优化
        List<Question> questionList = questionMapper.findByKeyword(keyword);

        List<QuestionVO> questionVOList = questionList.stream().map(question -> {
            QuestionVO questionVO = new QuestionVO();
            BeanUtils.copyProperties(question, questionVO);
            return questionVO;
        }).toList();

        return ApiResponseUtil.success("搜索问题成功", questionVOList);
    }
}
