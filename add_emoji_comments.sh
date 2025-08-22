#!/bin/bash

# Script to add "🦟👀" at the beginning of all code files
# Created: August 21, 2025

PROJECT_DIR="$(pwd)"
echo "Adding 🦟👀 comment to all code files in $PROJECT_DIR"

# Function to add comment based on file extension
add_comment() {
  local file=$1
  local extension="${file##*.}"
  local comment_prefix=""
  
  # Determine comment style based on file extension
  case "$extension" in
    js|json)
      comment_prefix="// 🦟👀"
      ;;
    html)
      comment_prefix="<!-- 🦟👀 -->"
      ;;
    css)
      comment_prefix="/* 🦟👀 */"
      ;;
    sql)
      comment_prefix="-- 🦟👀"
      ;;
    md)
      comment_prefix="<!-- 🦟👀 -->"
      ;;
    *)
      # Default to // comment for unknown file types
      comment_prefix="// 🦟👀"
      ;;
  esac
  
  # Skip if file already has the comment
  if grep -q "🦟👀" "$file"; then
    echo "  Skipping $file (already has emoji)"
    return
  fi
  
  # Create temporary file for modification
  local temp_file="${file}.temp"
  echo "$comment_prefix" > "$temp_file"
  cat "$file" >> "$temp_file"
  mv "$temp_file" "$file"
  echo "  Added to $file"
}

# Process all code files
find "$PROJECT_DIR" -type f \( \
  -name "*.js" -o \
  -name "*.html" -o \
  -name "*.css" -o \
  -name "*.sql" -o \
  -name "*.json" -o \
  -name "*.md" \
\) -not -path "*/node_modules/*" -not -path "*/\.git/*" | while read file; do
  add_comment "$file"
done

echo "Finished adding 🦟👀 comment to all code files!"
