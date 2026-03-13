/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	commands as vsc_commands,
	window as vsc_window,
	workspace as vsc_workspace,
	Uri as vsc_uri,
	WorkspaceEdit as vsc_ws_edit,
	Position as vsc_pos,
	Range as vsc_range,
	ViewColumn as vsc_view_column,
	env as vsc_env,
	ProgressLocation as vsc_status_pos,
} from 'vscode'

export const {
	registerCommand: vsc_add_cmd,
	registerTextEditorCommand: vsc_add_editor_cmd,
	executeCommand: vsc_exec_cmd,
} = vsc_commands

export const {
	showInformationMessage: vsc_info,
	showErrorMessage: vsc_error,
	showWarningMessage: vsc_warn,
	showQuickPick: vsc_quick_pick,
	createWebviewPanel: vsc_webview_init,
	tabGroups: vsc_tab_group,
} = vsc_window

export const {
	workspaceFolders: vsc_wsf_list,
	applyEdit: vsc_apply,
	openTextDocument: vsc_open,
	saveAll: vsc_save_all,
} = vsc_workspace

export function vsc_ws_prefix()
{
	const wsf = vsc_wsf_list[0]
	const uri = wsf.uri

	return uri.fsPath
}

export function vsc_map_ctx(ctx)
{
	return {
		environ: ctx.environmentVariableCollection,
		current: ctx.extension,

		binary: {
			mode: ctx.extensionMode,
			path: ctx.extensionPath,
			uri: ctx.extensionUri,
		},

		datadir: ctx.globalStoragePath,
		datadir_uri: ctx.globalStorageUri,

		ws_datadir: ctx.storagePath,
		ws_datadir_uri: ctx.storageUri,

		logdir: ctx.logPath,
		logdir_uri: ctx.logUri,

		secret: ctx.secrets,

		state: ctx.globalState,
		ws_state: ctx.workspaceState,

		lm_access: ctx.languageModelAccessInformation,
		cleanup: ctx.subscriptions,
	}
}

export function vsc_fetch_config(key)
{
	const raw = vsc_workspace.getConfiguration(key)
	const str = JSON.stringify(raw)
	const json = JSON.parse(str)

	return json
}

export {
	vsc_commands,
	vsc_window,
	vsc_workspace,
	vsc_uri,
	vsc_ws_edit,
	vsc_pos,
	vsc_range,
	vsc_view_column,
	vsc_env,
	vsc_status_pos,
}
