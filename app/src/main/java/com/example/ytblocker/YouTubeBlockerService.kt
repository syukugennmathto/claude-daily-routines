package com.example.ytblocker

import android.accessibilityservice.AccessibilityService
import android.graphics.PixelFormat
import android.os.Build
import android.provider.Settings
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.widget.Button

/**
 * Watches Chrome via the accessibility APIs. When the address bar shows a youtube.com URL
 * during an active block window, a full-screen overlay is drawn on top of Chrome.
 *
 * This approach needs no root: it relies only on the Accessibility API (to read the URL)
 * and the "Draw over other apps" permission (to show the block screen).
 */
class YouTubeBlockerService : AccessibilityService() {

    private val windowManager by lazy {
        getSystemService(WINDOW_SERVICE) as WindowManager
    }
    private var overlayView: View? = null

    // Chromium-based browsers we support. Brave is Chromium-based, so it exposes the same
    // url_bar view id as Chrome.
    private val browserPackages = setOf(
        "com.android.chrome",
        "com.chrome.beta",
        "com.chrome.dev",
        "com.chrome.canary",
        "com.brave.browser",
        "com.brave.browser_beta",
        "com.brave.browser_nightly"
    )

    // Each browser exposes its address bar text under <package>:id/url_bar.
    private val urlBarIds = browserPackages.map { "$it:id/url_bar" }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        val pkg = event?.packageName?.toString() ?: return

        // We only subscribe to Chrome packages (see accessibility_service_config.xml),
        // so anything else here is our own overlay window -> ignore it.
        if (pkg !in browserPackages) return

        val url = extractUrl()
        val isBlockedSite = url != null && isBlockedUrl(url)

        if (isBlockedSite && ScheduleRepository.isBlockedNow(this)) {
            showOverlay()
        } else {
            removeOverlay()
        }
    }

    override fun onInterrupt() { /* no-op */ }

    override fun onUnbind(intent: android.content.Intent?): Boolean {
        removeOverlay()
        return super.onUnbind(intent)
    }

    // Domains to block. Matching is done on the URL host, so "x.com" blocks x.com only and
    // NOT sites that merely contain that text (e.g. netflix.com).
    private val blockedDomains = setOf(
        "youtube.com",
        "youtu.be",
        "instagram.com",
        "instagr.am",
        "twitter.com",
        "x.com"
    )

    private fun isBlockedUrl(url: String): Boolean {
        val host = hostOf(url)
        return blockedDomains.any { host == it || host.endsWith(".$it") }
    }

    /**
     * Extracts the host from whatever the address bar shows. The bar usually shows just the host
     * (e.g. "youtube.com", "m.youtube.com") but can also show a full URL while loading, or a
     * search phrase while typing.
     */
    private fun hostOf(raw: String): String {
        var s = raw.trim().lowercase()
        val scheme = s.indexOf("://")
        if (scheme >= 0) s = s.substring(scheme + 3)
        // Keep only the host portion: drop path, query, and any trailing text after a space.
        s = s.substringBefore(' ').substringBefore('/').substringBefore('?')
        return s
    }

    private fun extractUrl(): String? {
        val root = rootInActiveWindow ?: return null
        try {
            for (id in urlBarIds) {
                val nodes = root.findAccessibilityNodeInfosByViewId(id)
                if (!nodes.isNullOrEmpty()) {
                    val text = nodes[0].text?.toString()
                    nodes.forEach { it.recycle() }
                    if (!text.isNullOrBlank()) return text
                }
            }
        } catch (e: Exception) {
            return null
        }
        return null
    }

    private fun showOverlay() {
        if (overlayView != null) return // already blocking
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) return

        val view = LayoutInflater.from(this).inflate(R.layout.overlay_block, null)
        view.findViewById<Button>(R.id.closeButton).setOnClickListener {
            removeOverlay()
            performGlobalAction(GLOBAL_ACTION_HOME)
        }

        val type = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY // API 26+
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            type,
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                WindowManager.LayoutParams.FLAG_FULLSCREEN,
            PixelFormat.OPAQUE
        )

        try {
            windowManager.addView(view, params)
            overlayView = view
        } catch (e: Exception) {
            overlayView = null
        }
    }

    private fun removeOverlay() {
        overlayView?.let {
            try {
                windowManager.removeView(it)
            } catch (e: Exception) {
                // already detached
            }
        }
        overlayView = null
    }
}
