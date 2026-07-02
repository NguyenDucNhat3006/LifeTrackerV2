<?php

header('Content-Type: application/json');

echo json_encode([
    "status" => "OK",
    "service" => "LifeTracker API",
    "version" => "1.0.0"
]);