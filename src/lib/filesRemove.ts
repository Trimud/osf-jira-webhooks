import fs from 'fs';

const PATH: string = './logs';
const DAYS_OFFSET: number = 5;

// Delete old log files
export const deleteLogFiles = () => {
    fs.readdir(PATH, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }

        // Loop through all files
        for (const file of files) {
            // Delete only log files
            if (file.indexOf('logs') > -1) {
                let filePath = PATH + '/' + file,
                    now = new Date(),
                    daysBack = now.setDate(now.getDate() - DAYS_OFFSET);

                // Get file stats
                fs.stat(filePath, (err, stat) => {
                    let createdTime = new Date(stat.birthtimeMs).getTime();

                    if (err) {
                        console.error(err);
                        return;
                    }

                    // Delete file if older than offset date
                    if (createdTime < daysBack) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                            console.error(err);
                            return;
                            }
                            console.log(`File removed: ${filePath}`);
                        });
                    }
                });
            }
        }
    });
}
