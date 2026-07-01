package com.example.chunkpaste

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
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.chunkpaste.ui.theme.ChunkPasteTheme

/**
 * チャンク一覧のメイン画面。
 *
 * - 上部バー: タイトル、クリアボタン、自動コピーモードのトグル（右上）
 * - 本体: チャンクを [LazyColumn] で一覧表示。タップでコピー
 * - FAB: 自動コピーモード ON のとき「次のチャンクをコピー」を表示
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChunkListScreen(
    viewModel: ClipboardViewModel = viewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }

    // 一度きりのイベント（コピー完了など）を Snackbar で表示する。
    androidx.compose.runtime.LaunchedEffect(Unit) {
        viewModel.events.collect { message ->
            snackbarHostState.currentSnackbarData?.dismiss()
            snackbarHostState.showSnackbar(message)
        }
    }

    ChunkListContent(
        uiState = uiState,
        snackbarHostState = snackbarHostState,
        onClearAll = viewModel::clearAll,
        onToggleAutoCopy = viewModel::toggleAutoCopyMode,
        onCopyChunk = viewModel::copyChunk,
        onCopyNext = viewModel::copyNextChunk,
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ChunkListContent(
    uiState: ChunkUiState,
    snackbarHostState: SnackbarHostState,
    onClearAll: () -> Unit,
    onToggleAutoCopy: () -> Unit,
    onCopyChunk: (Chunk) -> Unit,
    onCopyNext: () -> Unit,
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("ChunkPaste") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                ),
                actions = {
                    // 自動コピーモードのトグル（右上）
                    IconButton(onClick = onToggleAutoCopy) {
                        Icon(
                            imageVector = Icons.Filled.PlayArrow,
                            contentDescription = "自動コピーモード切り替え",
                            tint = if (uiState.autoCopyMode) {
                                MaterialTheme.colorScheme.primary
                            } else {
                                MaterialTheme.colorScheme.onPrimaryContainer
                            },
                        )
                    }
                    // 全チャンクをクリア
                    IconButton(
                        onClick = onClearAll,
                        enabled = uiState.chunks.isNotEmpty(),
                    ) {
                        Icon(
                            imageVector = Icons.Filled.DeleteSweep,
                            contentDescription = "全てクリア",
                        )
                    }
                },
            )
        },
        floatingActionButton = {
            if (uiState.autoCopyMode && uiState.chunks.isNotEmpty()) {
                val nextChunk = uiState.chunks.getOrNull(
                    uiState.nextAutoIndex.coerceIn(0, uiState.chunks.lastIndex)
                )
                ExtendedFloatingActionButton(
                    onClick = onCopyNext,
                    icon = { Icon(Icons.Filled.SkipNext, contentDescription = null) },
                    text = { Text("次をコピー ${nextChunk?.label ?: ""}") },
                )
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { innerPadding ->
        if (uiState.chunks.isEmpty()) {
            EmptyState(modifier = Modifier.padding(innerPadding))
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(
                    items = uiState.chunks,
                    key = { "${it.index}-${it.total}-${it.text.hashCode()}" },
                ) { chunk ->
                    val isNext = uiState.autoCopyMode &&
                        uiState.chunks.getOrNull(uiState.nextAutoIndex) === chunk
                    ChunkCard(
                        chunk = chunk,
                        highlighted = isNext,
                        onClick = { onCopyChunk(chunk) },
                    )
                }
            }
        }
    }
}

/** 1 チャンクを表すカード。タップでコピーする。 */
@Composable
private fun ChunkCard(
    chunk: Chunk,
    highlighted: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val containerColor = when {
        highlighted -> MaterialTheme.colorScheme.tertiaryContainer
        chunk.copied -> MaterialTheme.colorScheme.surfaceVariant
        else -> MaterialTheme.colorScheme.surface
    }
    Card(
        onClick = onClick,
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = containerColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = chunk.label,
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary,
                )
                Icon(
                    imageVector = Icons.Filled.ContentCopy,
                    contentDescription = "コピー",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Spacer(Modifier.height(6.dp))
            Text(
                text = chunk.preview,
                style = MaterialTheme.typography.bodyLarge,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Spacer(Modifier.height(4.dp))
            Text(
                text = "${chunk.text.length} 文字",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

/** チャンクが無いときの案内表示。 */
@Composable
private fun EmptyState(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxSize().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = "まだチャンクがありません",
            style = MaterialTheme.typography.titleMedium,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text = "長いテキストをコピーすると、\n自動で 75 文字ごとに分割して表示します。",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun ChunkListPreview() {
    ChunkPasteTheme {
        Surface(color = Color.Unspecified) {
            ChunkListContent(
                uiState = ChunkUiState(
                    chunks = Chunk.split(
                        "これはプレビュー用のサンプルテキストです。".repeat(10)
                    ),
                    autoCopyMode = true,
                    nextAutoIndex = 1,
                ),
                snackbarHostState = remember { SnackbarHostState() },
                onClearAll = {},
                onToggleAutoCopy = {},
                onCopyChunk = {},
                onCopyNext = {},
            )
        }
    }
}
