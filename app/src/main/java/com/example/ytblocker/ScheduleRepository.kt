package com.example.ytblocker

import android.content.Context
import org.json.JSONArray
import java.util.Calendar

/**
 * Persists the list of schedules in SharedPreferences as a JSON array.
 *
 * Both the UI (MainActivity) and the AccessibilityService read/write through here, so the
 * service always sees the latest schedule the user configured.
 */
object ScheduleRepository {
    private const val PREFS = "yt_blocker_prefs"
    private const val KEY = "schedules"

    fun load(context: Context): List<Schedule> {
        val raw = prefs(context).getString(KEY, null) ?: return emptyList()
        return try {
            val arr = JSONArray(raw)
            (0 until arr.length()).map { Schedule.fromJson(arr.getJSONObject(it)) }
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun save(context: Context, schedules: List<Schedule>) {
        val arr = JSONArray()
        schedules.forEach { arr.put(it.toJson()) }
        prefs(context).edit().putString(KEY, arr.toString()).apply()
    }

    /** True if any enabled schedule covers the current wall-clock time. */
    fun isBlockedNow(context: Context): Boolean {
        val now = Calendar.getInstance()
        val minutes = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)
        return load(context).any { it.isActiveAt(minutes) }
    }

    private fun prefs(context: Context) =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
}
