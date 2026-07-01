package com.example.chunkpaste

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** [Chunk.split] とプレビュー生成の単体テスト。 */
class ChunkTest {

    @Test
    fun split_emptyString_returnsEmptyList() {
        assertTrue(Chunk.split("").isEmpty())
    }

    @Test
    fun split_shorterThanChunkSize_returnsSingleChunk() {
        val chunks = Chunk.split("hello")
        assertEquals(1, chunks.size)
        assertEquals("hello", chunks[0].text)
        assertEquals(1, chunks[0].total)
        assertEquals("1 / 1", chunks[0].label)
    }

    @Test
    fun split_exactlyChunkSize_returnsSingleChunk() {
        val text = "a".repeat(Chunk.CHUNK_SIZE)
        val chunks = Chunk.split(text)
        assertEquals(1, chunks.size)
        assertEquals(Chunk.CHUNK_SIZE, chunks[0].text.length)
    }

    @Test
    fun split_150chars_returnsTwoChunksOf75() {
        val text = "a".repeat(150)
        val chunks = Chunk.split(text)
        assertEquals(2, chunks.size)
        assertEquals(75, chunks[0].text.length)
        assertEquals(75, chunks[1].text.length)
        assertEquals("1 / 2", chunks[0].label)
        assertEquals("2 / 2", chunks[1].label)
    }

    @Test
    fun split_remainderGoesToLastChunk() {
        val text = "a".repeat(160) // 75 + 75 + 10
        val chunks = Chunk.split(text)
        assertEquals(3, chunks.size)
        assertEquals(75, chunks[0].text.length)
        assertEquals(75, chunks[1].text.length)
        assertEquals(10, chunks[2].text.length)
    }

    @Test
    fun split_concatenationReproducesOriginal() {
        val text = "見出し".repeat(100)
        val chunks = Chunk.split(text)
        assertEquals(text, chunks.joinToString("") { it.text })
    }

    @Test
    fun preview_truncatesLongTextWithEllipsis() {
        val text = "x".repeat(50)
        val chunk = Chunk(index = 0, total = 1, text = text)
        assertEquals("x".repeat(Chunk.PREVIEW_LENGTH) + "...", chunk.preview)
    }

    @Test
    fun preview_shortTextIsNotTruncated() {
        val chunk = Chunk(index = 0, total = 1, text = "short")
        assertEquals("short", chunk.preview)
    }
}
