#!/bin/bash

echo "Installing compatible CocoaPods version..."
sudo gem install cocoapods -v 1.11.3

echo "Running pod install..."
cd /Users/jordonfoster/hopevale/ios/App
pod install

echo "Done!"
