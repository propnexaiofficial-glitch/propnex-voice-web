import paramiko
import os

local_chatbot_ts = "src/app/api/chatbot/route.ts"
local_chatbot_tsx = "src/components/layout/sidebar-chatbot.tsx"

remote_chatbot_ts = "/root/propnex-voice-web/src/app/api/chatbot/route.ts"
remote_chatbot_tsx = "/root/propnex-voice-web/src/components/layout/sidebar-chatbot.tsx"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect('200.234.34.240', username='root', password='Propnexai@123', timeout=10)
    
    sftp = ssh.open_sftp()
    
    print("Uploading route.ts...")
    sftp.put(local_chatbot_ts, remote_chatbot_ts)
    
    print("Uploading sidebar-chatbot.tsx...")
    sftp.put(local_chatbot_tsx, remote_chatbot_tsx)
    
    sftp.close()
    
    commands = [
        "cd /root/propnex-voice-web && npm run build > build.log 2>&1",
        "cd /root/propnex-voice-web && pm2 restart propnexai-frontend"
    ]
    
    for cmd in commands:
        print(f"--- Running: {cmd} ---")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        
        # Wait for command to finish
        exit_status = stdout.channel.recv_exit_status()
        print(f"Exit status: {exit_status}")
        
finally:
    ssh.close()
