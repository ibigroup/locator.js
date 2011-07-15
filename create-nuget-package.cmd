xcopy src\*.js package\content\scripts /i
del *.nupkg
nuget\NuGet.exe pack package\Locator.nuspec -Version %1