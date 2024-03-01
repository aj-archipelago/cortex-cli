#!/bin/bash

# Get the list of subdirectories
subdirs=(*/)
for dir in "${subdirs[@]}"; do
  # If a package.json file exists in the subdirectory
  if [[ -f "${dir}package.json" ]]; then
    # Go into the subdirectory
    cd $dir
    # Link the package
    echo "Linking $dir..."
    npm link
    # Go back to the root directory
    cd ..
  fi
done

echo "All workspaces linked!"