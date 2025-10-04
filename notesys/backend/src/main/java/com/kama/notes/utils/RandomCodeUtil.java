package com.kama.notes.utils;

import java.util.Random;

public class RandomCodeUtil {
    public static String generateNumberCode(int length) {
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < length; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }
}
