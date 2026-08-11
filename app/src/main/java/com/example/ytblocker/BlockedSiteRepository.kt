package com.example.ytblocker

import android.content.Context
import org.json.JSONArray

/**
 * Stores the list of blocked domains (e.g. "youtube.com") in SharedPreferences.
 *
 * Matching against a browser's address bar is host-based (see YouTubeBlockerService), so
 * "x.com" blocks x.com only and not unrelated sites like netflix.com.
 */
object BlockedSiteRepository {
    private const val PREFS = "yt_blocker_prefs"
    private const val KEY = "blocked_sites"

    // Seeded on first launch. The user can add/remove entries from the app afterwards.
    private val DEFAULTS = listOf(
        "youtube.com",
        "youtu.be",
        "instagram.com",
        "instagr.am",
        "twitter.com",
        "x.com"
    )

    fun load(context: Context): List<String> {
        val prefs = prefs(context)
        if (!prefs.contains(KEY)) {
            save(context, DEFAULTS)
            return DEFAULTS
        }
        val raw = prefs.getString(KEY, null) ?: return DEFAULTS
        return try {
            val arr = JSONArray(raw)
            (0 until arr.length()).map { arr.getString(it) }
        } catch (e: Exception) {
            DEFAULTS
        }
    }

    fun save(context: Context, sites: List<String>) {
        val arr = JSONArray()
        sites.forEach { arr.put(it) }
        prefs(context).edit().putString(KEY, arr.toString()).apply()
    }

    /**
     * Cleans user input into a bare domain: strips scheme, "www.", path and query.
     * Returns null if nothing usable remains.
     */
    fun normalize(input: String): String? {
        var s = input.trim().lowercase()
        if (s.isEmpty()) return null
        val scheme = s.indexOf("://")
        if (scheme >= 0) s = s.substring(scheme + 3)
        s = s.substringBefore(' ').substringBefore('/').substringBefore('?')
        if (s.startsWith("www.")) s = s.substring(4)
        // Must look like a domain (contain a dot and no spaces).
        if (s.isEmpty() || !s.contains('.')) return null
        return s
    }

    private fun prefs(context: Context) =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
}
