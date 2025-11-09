#!/bin/bash

echo "Installing main CocoaPods gem..."
sudo gem install cocoapods -v 1.15.2

echo "Running pod install..."
cd /Users/jordonfoster/hopevale/ios/App
/usr/local/bin/pod install || pod install

echo "Done! CocoaPods is now set up."
