import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect('200.234.34.240', username='root', password='Propnexai@123', timeout=10)
    
    commands = [
        "pm2 flush",
        "npm cache clean --force",
        "rm -rf /root/propnexai-admin-panel-old",
        "rm -rf /root/propnexai-admin-panel-old2",
        "df -h /"
    ]
    
    for cmd in commands:
        print(f"--- Running: {cmd} ---")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        print(stdout.read().decode())
        err = stderr.read().decode()
        if err:
            print("STDERR:", err)
        
finally:
    ssh.close()
