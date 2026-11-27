' Starts the my_star activity with no window. Windows runs this at login (Startup folder).
Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = dir
sh.Run "cmd /c node --env-file=.env index.js > activity.log 2>&1", 0, False
