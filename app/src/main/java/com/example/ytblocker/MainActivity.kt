package com.example.ytblocker

import android.app.TimePickerDialog
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import java.util.Calendar

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    BlockerScreen()
                }
            }
        }
    }
}

@Composable
private fun BlockerScreen() {
    val context = LocalContext.current
    var schedules by remember { mutableStateOf(ScheduleRepository.load(context)) }

    // Bumped on ON_RESUME so permission status refreshes after returning from Settings.
    var refresh by remember { mutableStateOf(0) }
    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                refresh++
                schedules = ScheduleRepository.load(context)
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    val accessibilityOn = remember(refresh) { isAccessibilityEnabled(context) }
    val overlayOn = remember(refresh) { canDrawOverlays(context) }

    fun persist(list: List<Schedule>) {
        schedules = list
        ScheduleRepository.save(context, list)
    }

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = {
                    pickStartThenEnd(context) { start, end ->
                        persist(
                            schedules + Schedule(
                                id = System.currentTimeMillis(),
                                startMinutes = start,
                                endMinutes = end,
                                enabled = true
                            )
                        )
                    }
                },
                icon = { Icon(Icons.Filled.Add, contentDescription = null) },
                text = { Text("時間帯を追加") }
            )
        }
    ) { inner ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(inner)
                .padding(16.dp)
        ) {
            Text(
                "YouTube Blocker",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(Modifier.height(4.dp))
            Text(
                "設定した時間帯に Chrome で youtube.com を開くとブロックします。",
                color = Color.Gray,
                fontSize = 14.sp
            )
            Spacer(Modifier.height(16.dp))

            PermissionCard(
                title = "アクセシビリティ",
                granted = accessibilityOn,
                hint = "Chrome のアドレスバーを読むために必要です。",
                buttonText = "設定を開く"
            ) {
                context.startActivity(
                    Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                )
            }
            Spacer(Modifier.height(8.dp))
            PermissionCard(
                title = "他のアプリの上に重ねて表示",
                granted = overlayOn,
                hint = "ブロック画面を表示するために必要です。",
                buttonText = "設定を開く"
            ) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${context.packageName}")
                ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
            }

            Spacer(Modifier.height(16.dp))
            Text("ブロックする時間帯", fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))

            if (schedules.isEmpty()) {
                Text(
                    "まだ時間帯が登録されていません。右下のボタンから追加してください。",
                    color = Color.Gray
                )
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(schedules, key = { it.id }) { schedule ->
                        ScheduleRow(
                            schedule = schedule,
                            onToggle = { enabled ->
                                persist(schedules.map {
                                    if (it.id == schedule.id) it.copy(enabled = enabled) else it
                                })
                            },
                            onDelete = {
                                persist(schedules.filterNot { it.id == schedule.id })
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun PermissionCard(
    title: String,
    granted: Boolean,
    hint: String,
    buttonText: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (granted) Color(0xFFE6F4EA) else Color(0xFFFDECEA)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    (if (granted) "✓ " else "✗ ") + title,
                    fontWeight = FontWeight.Bold
                )
                Text(hint, fontSize = 13.sp, color = Color.Gray)
            }
            if (!granted) {
                Button(onClick = onClick) { Text(buttonText) }
            }
        }
    }
}

@Composable
private fun ScheduleRow(
    schedule: Schedule,
    onToggle: (Boolean) -> Unit,
    onDelete: () -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "${Schedule.formatTime(schedule.startMinutes)} 〜 " +
                    Schedule.formatTime(schedule.endMinutes),
                fontSize = 18.sp,
                modifier = Modifier.weight(1f)
            )
            Switch(checked = schedule.enabled, onCheckedChange = onToggle)
            IconButton(onClick = onDelete) {
                Icon(Icons.Filled.Delete, contentDescription = "削除")
            }
        }
    }
}

/** Shows a start-time picker, then an end-time picker, then reports both as minutes-of-day. */
private fun pickStartThenEnd(context: Context, onPicked: (Int, Int) -> Unit) {
    val now = Calendar.getInstance()
    TimePickerDialog(
        context,
        { _, startH, startM ->
            TimePickerDialog(
                context,
                { _, endH, endM -> onPicked(startH * 60 + startM, endH * 60 + endM) },
                7, 0, true
            ).apply { setTitle("終了時刻") }.show()
        },
        now.get(Calendar.HOUR_OF_DAY), 0, true
    ).apply { setTitle("開始時刻") }.show()
}

private fun isAccessibilityEnabled(context: Context): Boolean {
    val expected = "${context.packageName}/${YouTubeBlockerService::class.java.name}"
    val enabled = Settings.Secure.getString(
        context.contentResolver,
        Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
    ) ?: return false
    return enabled.split(":").any { it.equals(expected, ignoreCase = true) }
}

private fun canDrawOverlays(context: Context): Boolean =
    Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(context)
