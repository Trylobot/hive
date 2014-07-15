mkdir distro
mkdir distro\temp

node print_version.js > distro\temp\version.txt
node print_package_json_release.js > distro\temp\package.json

set version=X.X.X
set /p version= < distro\temp\version.txt

set archive=trylobot-hive-v%version%.nw

del distro\%archive%
7z a -tzip distro\%archive% @release_file_list.txt

cd distro\temp
7z a -tzip ..\%archive% package.json
cd ..\..

del distro\temp\version.txt
del distro\temp\package.json
rmdir distro\temp

