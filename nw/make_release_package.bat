mkdir dist
mkdir dist\temp

node print_version.js > dist\temp\version.txt
node print_package_json_release.js > dist\temp\package.json

set version=X.X.X
set /p version= < dist\temp\version.txt

del dist\trylobot-hive-v%version%.nw
7z a -tzip dist\trylobot-hive-v%version%.nw @release_file_list.txt

del dist\temp\version.txt
del dist\temp\package.json
rmdir dist\temp

