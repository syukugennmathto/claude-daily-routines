package com.example.ytblocker

import org.json.JSONObject

/**
 * A single block window. Times are stored as "minutes since midnight" (0..1439).
 *
 * Overnight ranges are supported: if [startMinutes] > [endMinutes] (e.g. 22:00 -> 07:00),
 * the window wraps past midnight.
 */
data class Schedule(
    val id: Long,
    val startMinutes: Int,
    val endMinutes: Int,
    val enabled: Boolean
) {
    /** Returns true if [minutesOfDay] (0..1439) falls inside this (enabled) window. */
    fun isActiveAt(minutesOfDay: Int): Boolean {
        if (!enabled) return false
        if (startMinutes == endMinutes) return false // zero-length window blocks nothing
        return if (startMinutes < endMinutes) {
            minutesOfDay in startMinutes until endMinutes
        } else {
            // Wraps past midnight.
            minutesOfDay >= startMinutes || minutesOfDay < endMinutes
        }
    }

    fun toJson(): JSONObject = JSONObject().apply {
        put("id", id)
        put("start", startMinutes)
        put("end", endMinutes)
        put("enabled", enabled)
    }

    companion object {
        fun fromJson(o: JSONObject) = Schedule(
            id = o.getLong("id"),
            startMinutes = o.getInt("start"),
            endMinutes = o.getInt("end"),
            enabled = o.getBoolean("enabled")
        )

        fun formatTime(minutes: Int): String {
            val h = (minutes / 60) % 24
            val m = minutes % 60
            return "%02d:%02d".format(h, m)
        }
    }
}
