<?php
$token = getenv('GITHUB_TOKEN');
echo "Token starts with: " . substr($token, 0, 5) . "...\n"; // For debugging only
?>
