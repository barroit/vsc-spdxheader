/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { dirname } from 'node:path'

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
	Disposable as vsc_disposable,
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
	onDidChangeWindowState: vsc_track_window_state,
} = vsc_window

export const {
	applyEdit: vsc_apply,
	openTextDocument: vsc_open,
	saveAll: vsc_save_all,
	asRelativePath: vsc_relative_path,
} = vsc_workspace

export function vsc_has_ws()
{
	if (!vsc_workspace.workspaceFolders)
		return 0
	else if (vsc_workspace.workspaceFolders.length == 1)
		return 1
	else
		return vsc_workspace.workspaceFile.scheme != 'untitled'
}

export function vsc_ws_prefix()
{
	const wsf_list = vsc_workspace.workspaceFolders

	if (wsf_list.length > 1)
		return dirname(vsc_workspace.workspaceFile.fsPath)

	return wsf_list[0].uri.fsPath
}

export function vsc_map_ctx(ctx)
{
	const remap = {
		environ: ctx.environmentVariableCollection,
		current: ctx.extension,

		binary: {
			mode: ctx.extensionMode,
			path: ctx.extensionPath,
			uri: ctx.extensionUri,
		},

		data_dir: ctx.globalStoragePath,
		data_dir_uri: ctx.globalStorageUri,

		ws_data_dir: ctx.storagePath,
		ws_data_dir_uri: ctx.storageUri,

		log_dir: ctx.logPath,
		log_dir_uri: ctx.logUri,

		secret: ctx.secrets,

		state: ctx.globalState,
		ws_state: ctx.workspaceState,

		lm_access: ctx.languageModelAccessInformation,
		cleanup: ctx.subscriptions,
	}

	return remap
}

export function vsc_resolve_config(key)
{
	const raw = vsc_workspace.getConfiguration(key)
	const str = JSON.stringify(raw)
	const json = JSON.parse(str)

	return json
}

export function vsc_current_editor()
{
	return vsc_window.activeTextEditor
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
	vsc_disposable,
}
