use lazy_static::lazy_static;
use parking_lot::RwLock;
use smb::{Client, ClientConfig, UncPath, connection::{ConnectionConfig, AuthMethodsConfig}};
use std::collections::HashMap;
use std::sync::Arc;
use std::str::FromStr;

lazy_static! {
    static ref SMB_CLIENTS: Arc<RwLock<HashMap<String, Arc<Client>>>> = Arc::new(RwLock::new(HashMap::new()));
    static ref SMB_CLIENT_INFO: Arc<RwLock<HashMap<String, SmbClientInfo>>> = Arc::new(RwLock::new(HashMap::new()));
}

#[derive(Debug, serde::Deserialize)]
pub struct SmbOption {
    pub username: String,
    pub password: String,
    pub domain: String,
}

#[derive(Debug, Clone)]
pub struct SmbClientInfo {
    pub server: String,
    pub share: String,
    pub root_path: Option<String>,
}

pub async fn create_client(client_id: String, option: SmbOption) -> Result<(), String> {
    {
        let clients = SMB_CLIENTS.read();
        if clients.contains_key(&client_id) {
            return Ok(());
        }
    }
    
    log::info!("Creating SMB client with domain: {}", option.domain);
    
    let client_config = ClientConfig {
        connection: ConnectionConfig {
            smb2_only_negotiate: true,
            auth_methods: AuthMethodsConfig {
                ntlm: true,
                kerberos: false,
            },
            client_name: Some("xiaohei-player".to_string()),
            ..Default::default()
        },
        ..Default::default()
    };
    
    let client = Client::new(client_config);
    
    let unc_path = UncPath::from_str(&option.domain)
        .map_err(|e| format!("Invalid UNC path: {:?}", e))?;
    
    let server = unc_path.server();
    log::info!("Parsed server: {}", server);
    
    let share_name = unc_path.share()
        .ok_or_else(|| "UNC path must include a share name".to_string())?;
    log::info!("Parsed share: {}", share_name);
    
    let root_path = unc_path.path().map(|p| p.to_string());
    log::info!("Parsed root_path: {:?}", root_path);
    
    let connect_unc = UncPath::new(server)
        .map_err(|e| format!("Invalid server: {:?}", e))?
        .with_share(share_name)
        .map_err(|e| format!("Invalid share name: {:?}", e))?;
    
    log::info!("Connecting to: {}", connect_unc);
    
    client
        .share_connect(&connect_unc, &option.username, option.password)
        .await
        .map_err(|e| format!("Failed to connect to share: {:?}", e))?;
    
    let client_info = SmbClientInfo {
        server: server.to_string(),
        share: share_name.to_string(),
        root_path,
    };
    
    let mut clients = SMB_CLIENTS.write();
    clients.insert(client_id.clone(), Arc::new(client));
    
    let mut client_infos = SMB_CLIENT_INFO.write();
    client_infos.insert(client_id, client_info);
    
    Ok(())
}

pub async fn close_client(client_id: String) -> Result<(), String> {
    let client = {
        let clients = SMB_CLIENTS.read();
        clients
            .get(&client_id)
            .cloned()
            .ok_or_else(|| format!("Client {} not found", client_id))?
    };
    
    client
        .close()
        .await
        .map_err(|e| format!("Failed to close client: {:?}", e))?;
    
    let mut clients = SMB_CLIENTS.write();
    clients.remove(&client_id);
    
    let mut client_infos = SMB_CLIENT_INFO.write();
    client_infos.remove(&client_id);
    
    Ok(())
}

pub fn get_client(client_id: &str) -> Result<Arc<Client>, String> {
    let clients = SMB_CLIENTS.read();
    
    clients
        .get(client_id)
        .cloned()
        .ok_or_else(|| format!("Client {} not found", client_id))
}

pub fn get_client_info(client_id: &str) -> Result<SmbClientInfo, String> {
    let client_infos = SMB_CLIENT_INFO.read();
    
    client_infos
        .get(client_id)
        .cloned()
        .ok_or_else(|| format!("Client {} not found", client_id))
}

#[derive(Debug, serde::Serialize)]
pub struct SmbFileItem {
    pub filename: String,
    pub is_file: bool,
    pub is_directory: bool,
    pub is_symlink: bool,
    pub end_of_file: u64,
    pub last_write_time: u64,
    pub creation_time: u64,
    pub last_access_time: u64,
    pub file_id: String,
}
