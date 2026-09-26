package com.apiaura.apiaura.foundation.common.util;

import java.time.Instant;

public final class DateTimeUtil {

    private DateTimeUtil() {
    }

    public static Instant now() {
        return Instant.now();
    }
}
