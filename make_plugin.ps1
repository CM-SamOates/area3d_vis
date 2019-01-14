
$scriptPath = $PSScriptRoot

# Create the build output folder.
New-Item -ItemType Directory -Force -Path 'build'

# Delete any old plugin zip files.
If (Test-Path 'build/area3d_vis.zip'){
    Remove-Item 'build/area3d_vis.zip' -Confirm:$false
}

# Create a temp folder
If (Test-Path '_temp'){
    Remove-Item '_temp' -Confirm:$false
}
New-Item -ItemType Directory -Force -Path '_temp'
New-Item -ItemType Directory -Force -Path '_temp/kibana/area3d_vis'
New-Item -ItemType Directory -Force -Path '_temp/kibana/area3d_vis/public'

# Copy the plugin into the temp folder
Copy-Item 'index.js' '_temp/kibana/area3d_vis'
Copy-Item 'package.json' '_temp/kibana/area3d_vis'
Copy-Item 'public/*' '_temp/kibana/area3d_vis/public'

# Compress the temp folder into the plugin
Add-Type -A System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::CreateFromDirectory($scriptPath + '/_temp', $scriptPath + '/build/area3d_vis.zip')

# Delete the temp folder
Remove-Item '_temp' -Recurse -Force
