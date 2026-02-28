!macro customFinishPage
AutoCloseWindow true
Function StartApp
    StrCpy $1 ""
    ${StdUtils.ExecShellAsUser} $0 "$launchLink" "open" "$1"
FunctionEnd

Function .onInstSuccess
    Call StartApp
FunctionEnd
!macroend
# 安装部分
Section "Install"

  # 创建卸载程序
  WriteUninstaller $INSTDIR\uninstall.exe
  
  # 安装完成后删除卸载程序
  Delete $INSTDIR\uninstall.exe
SectionEnd
# 卸载功能
Section "Uninstall"
  # 删除注册表项
  DeleteRegKey HKCU "Software\3DMonitorEn"
SectionEnd