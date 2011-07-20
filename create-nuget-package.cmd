xcopy src\*.js package\content\scripts /i
del *.nupkg
%NuGetPath%\NuGet.exe pack package\Locator.nuspec -Version %1