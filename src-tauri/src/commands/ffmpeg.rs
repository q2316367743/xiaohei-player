use std::process::Command;

#[tauri::command]
pub async fn ffmpeg_command(cmd: String, args: Vec<String>) -> Result<String, String> {
    let cmd_clone = cmd.clone();
    let args_clone = args.clone();
    
    tokio::task::spawn_blocking(move || {
        let output = Command::new(&cmd_clone)
            .args(&args_clone)
            .output();
        
        match output {
            Ok(output) => {
                if output.status.success() {
                    Ok(String::from_utf8_lossy(&output.stdout).to_string())
                } else {
                    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
                    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                    Err(format!("Command failed: {}\nStderr: {}", stdout, stderr))
                }
            }
            Err(e) => Err(format!("Failed to execute command: {}", e))
        }
    }).await.map_err(|e| format!("Task failed: {:?}", e))?
}