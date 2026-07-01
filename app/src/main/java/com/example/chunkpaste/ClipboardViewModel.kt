package com.example.chunkpaste

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * 画面全体の状態。
 *
 * @param chunks         現在保持しているチャンク一覧
 * @param autoCopyMode   「次のチャンクを自動コピー」モードが ON か
 * @param nextAutoIndex  自動コピーモードで次にコピーするチャンクの位置（[chunks] のインデックス）
 */
data class ChunkUiState(
    val chunks: List<Chunk> = emptyList(),
    val autoCopyMode: Boolean = false,
    val nextAutoIndex: Int = 0,
)

/**
 * チャンクの生成・保持・コピー操作を管理する ViewModel。
 *
 * クリップボードの監視自体は [ClipboardObserver] が担い、
 * 監視の開始／停止は Activity のライフサイクル（フォアグラウンド）に合わせて行う。
 * Android 12 以降はフォアグラウンド時のみクリップボードを読めるため、
 * この設計により制約に準拠する。
 */
class ClipboardViewModel(application: Application) : AndroidViewModel(application) {

    private val observer = ClipboardObserver(application)

    private val _uiState = MutableStateFlow(ChunkUiState())
    val uiState: StateFlow<ChunkUiState> = _uiState.asStateFlow()

    /** Snackbar 表示など、一度きりのイベント。 */
    private val _events = Channel<String>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    /** すでに分割済みの元テキスト。重複追加を防ぐために保持する。 */
    private val processedSources = mutableSetOf<String>()

    /** 自分でクリップボードに書き込んだテキスト。監視リスナーでの再分割を防ぐ。 */
    private val selfCopiedTexts = mutableSetOf<String>()

    /**
     * クリップボード監視を開始する。Activity の onResume から呼ぶこと。
     * 開始直後に現在のクリップボード内容も一度取り込む。
     */
    fun startMonitoring() {
        observer.start(::onClipboardText)
        observer.readCurrentText()?.let(::onClipboardText)
    }

    /** クリップボード監視を停止する。Activity の onPause から呼ぶこと。 */
    fun stopMonitoring() {
        observer.stop()
    }

    /** クリップボードから新しいテキストを検出したときの処理。 */
    private fun onClipboardText(text: String) {
        // 自分でコピーしたチャンク、またはすでに分割済みのテキストは無視する。
        if (text in selfCopiedTexts) return
        if (text in processedSources) return

        val newChunks = Chunk.split(text)
        if (newChunks.isEmpty()) return

        processedSources += text
        _uiState.update { state ->
            state.copy(chunks = state.chunks + newChunks)
        }
        emit("${newChunks.size} 個のチャンクに分割しました")
    }

    /**
     * チャンクをクリップボードにコピーする（カードのタップ）。
     * 自動コピーモードが ON の場合は、コピーしたチャンクの次を次回対象に設定する。
     */
    fun copyChunk(chunk: Chunk) {
        // markCopied がインスタンスを差し替える前に位置を確定させておく。
        val listIndex = _uiState.value.chunks.indexOfFirst { it === chunk }

        writeToClipboard(chunk.text)
        markCopied(chunk)

        if (_uiState.value.autoCopyMode && listIndex >= 0) {
            _uiState.update { it.copy(nextAutoIndex = listIndex + 1) }
        }
        emit("コピーしました")
    }

    /**
     * 自動コピーモードで「次のチャンク」をコピーして 1 つ進める（FAB から呼ぶ）。
     * 末尾を超えたら先頭に戻る。
     */
    fun copyNextChunk() {
        val state = _uiState.value
        if (state.chunks.isEmpty()) return

        val index = state.nextAutoIndex.coerceIn(0, state.chunks.lastIndex)
        val chunk = state.chunks[index]
        writeToClipboard(chunk.text)
        markCopied(chunk)

        val nextIndex = index + 1
        if (nextIndex >= state.chunks.size) {
            _uiState.update { it.copy(nextAutoIndex = 0) }
            emit("最後のチャンクをコピーしました（先頭に戻ります）")
        } else {
            _uiState.update { it.copy(nextAutoIndex = nextIndex) }
            emit("チャンク ${chunk.label} をコピーしました")
        }
    }

    /** 自動コピーモードを切り替える。ON にすると次回対象を先頭にリセットする。 */
    fun toggleAutoCopyMode() {
        _uiState.update { state ->
            val enabled = !state.autoCopyMode
            state.copy(autoCopyMode = enabled, nextAutoIndex = 0)
        }
        emit(
            if (_uiState.value.autoCopyMode) "自動コピーモード ON"
            else "自動コピーモード OFF"
        )
    }

    /** 全チャンクをクリアする。重複判定用の履歴もリセットする。 */
    fun clearAll() {
        processedSources.clear()
        selfCopiedTexts.clear()
        _uiState.update { it.copy(chunks = emptyList(), nextAutoIndex = 0) }
        emit("チャンクをクリアしました")
    }

    private fun writeToClipboard(text: String) {
        selfCopiedTexts += text
        observer.copyToClipboard(text)
    }

    private fun markCopied(chunk: Chunk) {
        _uiState.update { state ->
            state.copy(
                chunks = state.chunks.map {
                    if (it === chunk) it.copy(copied = true) else it
                }
            )
        }
    }

    private fun emit(message: String) {
        viewModelScope.launch { _events.send(message) }
    }

    override fun onCleared() {
        super.onCleared()
        observer.stop()
    }
}
