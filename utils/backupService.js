import { exec } from "child_process";
import dotenv from "dotenv";

dotenv.config();

const backupDatabase = () => {
  const dbName = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASS;

  const filePath = `backups/backup_${Date.now()}.sql`;

  const command = `mysqldump -u ${user} -p${password} ${dbName} > ${filePath}`;

  exec(command, (error) => {
    if (error) {
      console.log("❌ Backup failed:", error);
    } else {
      console.log("✅ Backup created:", filePath);
    }
  });
};

export { backupDatabase };  // ✅ IMPORTANT