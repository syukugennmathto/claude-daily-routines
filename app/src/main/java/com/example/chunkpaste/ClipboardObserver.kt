package com.example.chunkpaste

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context

/**
 * ClipboardManager をラップし、クリップボードの変化を監視する。
 *
 * Android 12 (API 31) 以降、クリップボードの読み取りはアプリがフォアグラウンドに
 * ある間のみ許可される。そのため、監視の開始／停止は Activity のライフサイクル
 * （onResume / onPause）に合わせて行うこと。
 *
 * バックグラウンドで [ClipboardManager.OnPrimaryClipChangedListener] が発火しても
 * getPrimaryClip() は空を返すため、フォアグラウンド時のみリスナーを登録する設計とする。
 */
class ClipboardObserver(context: Context) {

    private val clipboardManager =
        context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager

    private var listener: ClipboardManager.OnPrimaryClipChangedListener? = null

    /**
     * 監視を開始する。クリップボードのテキストが変化するたびに [onTextChanged] が呼ばれる。
     * 冪等: 既に監視中の場合は何もしない。
     */
    fun start(onTextChanged: (String) -> Unit) {
        if (listener != null) return
        val newListener = ClipboardManager.OnPrimaryClipChangedListener {
            readCurrentText()?.let(onTextChanged)
        }
        clipboardManager.addPrimaryClipChangedListener(newListener)
        listener = newListener
    }

    /** 監視を停止する。フォアグラウンドを離れる際に必ず呼ぶこと。 */
    fun stop() {
        listener?.let { clipboardManager.removePrimaryClipChangedListener(it) }
        listener = null
    }

    /**
     * 現在のクリップボードのテキストを取得する。
     * フォアグラウンド時のみ有効な値を返し、それ以外・非テキスト・空の場合は null。
     */
    fun readCurrentText(): String? {
        if (!clipboardManager.hasPrimaryClip()) return null
        val clip = clipboardManager.primaryClip ?: return null
        if (clip.itemCount == 0) return null
        val text = clip.getItemAt(0).coerceToText(appContext).toString()
        return text.ifBlank { null }
    }

    /**
     * 指定したテキストをクリップボードにコピーする。
     * ここでコピーした内容も監視リスナーで検知され得るが、
     * ViewModel 側で重複判定を行うため二重追加は起きない。
     */
    fun copyToClipboard(text: String) {
        val clip = ClipData.newPlainText(CLIP_LABEL, text)
        clipboardManager.setPrimaryClip(clip)
    }

    private val appContext: Context = context.applicationContext

    companion object {
        private const val CLIP_LABEL = "ChunkPaste"
    }
}
