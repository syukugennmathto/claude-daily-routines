package com.example.chunkpaste

/**
 * 分割された 1 チャンクを表すデータモデル。
 *
 * @param index      0 始まりのチャンク番号（表示時は +1 する）
 * @param total      同じ元テキストから生成されたチャンクの総数
 * @param text       このチャンクの本文（最大 [CHUNK_SIZE] 文字）
 * @param copied     一度でもコピーされたことがあるか（UI のハイライト用）
 */
data class Chunk(
    val index: Int,
    val total: Int,
    val text: String,
    val copied: Boolean = false,
) {
    /** 「1 / 3」形式のラベル。 */
    val label: String get() = "${index + 1} / $total"

    /** 先頭 [PREVIEW_LENGTH] 文字のプレビュー。超過分は「...」で省略する。 */
    val preview: String
        get() = if (text.length <= PREVIEW_LENGTH) {
            text
        } else {
            text.take(PREVIEW_LENGTH) + "..."
        }

    companion object {
        /** 1 チャンクあたりの最大文字数。 */
        const val CHUNK_SIZE = 75

        /** カードに表示するプレビュー文字数。 */
        const val PREVIEW_LENGTH = 30

        /**
         * [source] を [CHUNK_SIZE] 文字ごとに分割してチャンク一覧を生成する。
         * 端数は最後のチャンクに入る。空文字・空白のみの場合は空リストを返す。
         *
         * 例: 150 文字 → チャンク1(1〜75) + チャンク2(76〜150)
         */
        fun split(source: String): List<Chunk> {
            if (source.isEmpty()) return emptyList()
            val pieces = source.chunked(CHUNK_SIZE)
            val total = pieces.size
            return pieces.mapIndexed { i, piece ->
                Chunk(index = i, total = total, text = piece)
            }
        }
    }
}
