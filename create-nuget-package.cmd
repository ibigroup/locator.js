xcopy src\*.js package\content\scripts /i
del *.nupkg
%env.NuGetPath%\NuGet.exe pack package\Locator.nuspec -Version %1