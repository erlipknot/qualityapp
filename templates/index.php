<?php

// load Composer
require 'vendor/autoload.php';

use Zendesk\API\HttpClient as ZendeskAPI;

$subdomain = "z3nrafaelcabreraromero";
$username  = "rcabreraromero@zendesk.com";
$token     = "Jv5ZX9TTquXAg3umv6Od9VyWr68lKEirq4sSvX2m"; // replace this with your token

$client = new ZendeskAPI($subdomain, $username);
$client->setAuth('basic', ['username' => $username, 'token' => $token]);

?>