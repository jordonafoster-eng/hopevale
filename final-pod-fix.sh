#!/bin/bash

echo "Installing ffi gem..."
sudo gem install ffi

echo "Clearing CocoaPods cache..."
rm -rf ~/Library/Caches/CocoaPods

echo "Running pod install..."
cd /Users/jordonfoster/hopevale/ios/App
pod install

echo "Done!"
