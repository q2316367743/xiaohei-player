use crate::smb::client::{create_client, get_client, get_client_info, close_client, SmbFileItem, SmbOption};
use smb::{Directory, FileCreateArgs, UncPath};
use smb_fscc::{DirAccessMask, FileFullDirectoryInformation};
use std::sync::Arc;
use futures_util::StreamExt;

#[tauri::command]
pub async fn create_smb_client(client_id: String, option: SmbOption) -> Result<(), String> {
    create_client(client_id, option).await
}

#[tauri::command]
pub async fn close_smb_client(client_id: String) -> Result<(), String> {
    close_client(client_id).await
}

#[tauri::command]
pub async fn read_smb_dir(client_id: String, path: String) -> Result<Vec<SmbFileItem>, String> {
    let client = get_client(&client_id)?;
    let client_info = get_client_info(&client_id)?;
    
    let mut unc_path = UncPath::new(&client_info.server)
        .map_err(|e| format!("Invalid server: {:?}", e))?
        .with_share(&client_info.share)
        .map_err(|e| format!("Invalid share name: {:?}", e))?;
    
    if let Some(root_path) = &client_info.root_path {
        unc_path = unc_path.with_path(root_path);
    }
    
    if !path.is_empty() && path != "\\" && path != "/" {
        let normalized_path = path.replace('/', "\\").trim_matches('\\').to_string();
        if !normalized_path.is_empty() {
            unc_path = unc_path.with_add_path(&normalized_path);
        }
    }
    
    let directory = client
        .create_file(
            &unc_path,
            &FileCreateArgs::make_open_existing(
                DirAccessMask::new()
                    .with_list_directory(true)
                    .with_synchronize(true)
                    .into(),
            ),
        )
        .await
        .map_err(|e| format!("Failed to open directory: {:?}", e))?
        .unwrap_dir();
    
    let directory = Arc::new(directory);
    
    let mut items = Vec::new();
    let mut stream = Directory::query::<FileFullDirectoryInformation>(&directory, "*")
        .await
        .map_err(|e| format!("Failed to query directory: {:?}", e))?;
    
    while let Some(entry_result) = stream.next().await {
        let entry = entry_result.map_err(|e| format!("Failed to read directory entry: {:?}", e))?;
        
        let filename = entry.file_name.to_string();
        if filename == "." || filename == ".." {
            continue;
        }
        
        items.push(SmbFileItem {
            filename: filename.clone(),
            is_file: !entry.file_attributes.directory(),
            is_directory: entry.file_attributes.directory(),
            is_symlink: entry.file_attributes.reparse_point(),
            end_of_file: entry.end_of_file,
            last_write_time: *entry.last_write_time,
            creation_time: *entry.creation_time,
            last_access_time: *entry.last_access_time,
            file_id: entry.file_index.to_string(),
        });
    }
    
    Ok(items)
}
