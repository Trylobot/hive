/*
terminal-cursor.js
*/

/*
via: http://stackoverflow.com/questions/10585683/how-do-you-edit-existing-text-and-move-the-cursor-around-in-the-terminal
----
https://github.com/hij1nx/cdir/blob/master/cdir.js#L26
http://tldp.org/HOWTO/Bash-Prompt-HOWTO/x361.html
http://ascii-table.com/ansi-escape-sequences-vt-100.php

Position the Cursor: \033[<L>;<C>H or \033[<L>;<C>f (puts the cursor at line L and column C)
Move the cursor up N lines: \033[<N>A
Move the cursor down N lines: \033[<N>B
Move the cursor forward N columns: \033[<N>C
Move the cursor backward N columns: \033[<N>D
Clear the screen, move to (0,0): \033[2J
Erase to end of line: \033[K
Save cursor position: \033[s
Restore cursor position: \033[u

"The latter two codes are NOT honoured by many terminal emulators. The only ones that I'm aware of
  that do are xterm and nxterm - even though the majority of terminal emulators are based on xterm code.
  As far as I can tell, rxvt, kvt, xiterm, and Eterm do not support them. They are supported on the console."
*/

function set_cursor_position( L, C ) {
	process.stdout.write( "\033["+L+";"+C+"H" );
}

function cursor_move_up( L ) {
	process.stdout.write( "\033["+L+"A" );
}

function cursor_move_down( L ) {
	process.stdout.write( "\033["+L+"B" );
}

function cursor_move_forward( C ) {
	process.stdout.write( "\033["+C+"C" );
}

function cursor_move_backward( C ) {
	process.stdout.write( "\033["+C+"D" );
}

function clear_screen() {
	process.stdout.write( "\033[2J" );
}

function erase_to_end_of_line() {
	process.stdout.write( "\033[K" );
}

// not supported in many terminal emulators
function save_cursor_position() {
	process.stdout.write( "\033[s" );
}

// not supported in many terminal emulators
function restore_cursor_position() {
	process.stdout.write( "\033[u" );
}

exports.set_cursor_position = set_cursor_position;
exports.cursor_move_up = cursor_move_up;
exports.cursor_move_down = cursor_move_down;
exports.cursor_move_forward = cursor_move_forward;
exports.cursor_move_backward = cursor_move_backward;
exports.clear_screen = clear_screen;
exports.erase_to_end_of_line = erase_to_end_of_line;
exports.save_cursor_position = save_cursor_position;
exports.restore_cursor_position = restore_cursor_position;

