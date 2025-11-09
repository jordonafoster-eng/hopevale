#!/bin/bash

echo "Installing CocoaPods..."
sudo gem install cocoapods

echo "Setting up CocoaPods..."
cd /Users/jordonfoster/hopevale/ios/App
pod install

echo "Done! Now restart Xcode."
