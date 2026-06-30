package org.lamisplus.modules.prep.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Keyset (cursor) pagination envelope. {@code nextCursor} is the value to pass
 * back as {@code afterId} for the following page; null when there are no more
 * rows. No total count — keyset pagination intentionally avoids it.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KeysetPage<T> {
    private List<T> content;
    private Long nextCursor;
    private boolean hasMore;
}
