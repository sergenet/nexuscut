<?php
// Disable Passenger app by renaming the entry file
if (file_exists('/home/sergbcqk/nexuscut.io/app.js')) {
    rename('/home/sergbcqk/nexuscut.io/app.js', '/home/sergbcqk/nexuscut.io/app.js.bak');
    echo "Renamed app.js to app.js.bak\n";
} else {
    echo "app.js not found (maybe already renamed)\n";
}

// Kill all lingering Node/Passenger processes for this user
shell_exec('killall -9 -u sergbcqk node');
shell_exec('pkill -9 -u sergbcqk -f node');
shell_exec('pkill -9 -u sergbcqk -f passenger');

echo "Successfully killed background processes. The process limit should now be cleared.";
?>
