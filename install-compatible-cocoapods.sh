#!/bin/bash

echo "Installing dependencies..."
sudo gem install zeitwerk -v 2.6.18
sudo gem install cocoapods -v 1.10.2

echo "Running pod install..."
cd /Users/jordonfoster/hopevale/ios/App
pod install

echo "Done!"
