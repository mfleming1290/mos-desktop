#!/bin/sh
# On-demand administrative backup; no deletion, purge, live restore or service stop.
set -eu
umask 077
source=/mnt/user/mos-desktop/home
destination=/mnt/Apps/home-backup
test "$(id -u)" = 0
test "$(readlink -f "$source")" = "$source"
test "$(readlink -f "$destination")" = "$destination"
test "$(findmnt -n -o UUID -T "$source")" = 1cce377d-70dd-4f04-b345-4765382eb5c1
test "$(findmnt -n -o UUID -T "$destination")" = 3875e967-ac68-4c5b-ab44-e7feb71f61fa
test "$(stat -c %u "$source")" = 201001
# The enclosing user-created folder is unchanged. Backups themselves are private.
store=$destination/mos-desktop
if test ! -e "$store"; then mkdir -m 700 "$store"; fi
test ! -L "$store"
test "$(stat -c %u "$store")" = 0
test "$(stat -c %a "$store")" = 700
stamp=$(date -u +%Y%m%dT%H%M%SZ)
pending=$store/$stamp.partial
mkdir -m 700 "$pending"
mkdir "$pending/home" "$pending/restore-check"
rsync -aHAXx --numeric-ids "$source/" "$pending/home/"
# A live Home is not an application-consistent snapshot. Refuse acceptance if
# content or metadata changed during the copy; preserve partial data for inspection.
rsync -aHAXxnc --numeric-ids --delete --dry-run --itemize-changes "$source/" "$pending/home/" > "$pending/source-check.txt"
test ! -s "$pending/source-check.txt"
rsync -aHAXx --numeric-ids "$pending/home/" "$pending/restore-check/"
rsync -aHAXxnc --numeric-ids --delete --dry-run --itemize-changes "$pending/home/" "$pending/restore-check/" > "$pending/restore-check.txt"
test ! -s "$pending/restore-check.txt"
sync -f "$pending"
mv -T -n "$pending" "$store/$stamp"
test ! -e "$pending"
printf 'Verified backup and isolated restore: %s\n' "$store/$stamp"
