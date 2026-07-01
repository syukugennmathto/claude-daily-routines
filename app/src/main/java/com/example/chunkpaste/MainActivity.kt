package com.example.chunkpaste

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.chunkpaste.ui.theme.ChunkPasteTheme

/**
 * 唯一の Activity。Compose で [ChunkListScreen] を表示する。
 *
 * クリップボード監視は Android 12 以降の制約により「フォアグラウンド時のみ」動作する。
 * そのため onResume で監視を開始し、onPause で停止する。
 */
class MainActivity : ComponentActivity() {

    private val viewModel: ClipboardViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ChunkPasteTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background,
                ) {
                    ChunkListScreen(viewModel = viewModel)
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        // フォアグラウンドに入ったので監視開始（このタイミングでのみクリップボードを読める）。
        viewModel.startMonitoring()
    }

    override fun onPause() {
        super.onPause()
        // バックグラウンドではクリップボードを読めないため監視停止。
        viewModel.stopMonitoring()
    }
}
