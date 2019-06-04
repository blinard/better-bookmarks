data "azurerm_cosmosdb_account" "bbdb" {
  name                = "betterbookmarks"
  resource_group_name = "bb-rg"
}

data "azuread_user" "me" {
    user_principal_name = "brad.linard_outlook.com#EXT#@bradlinardoutlook.onmicrosoft.com"
}

data "azurerm_client_config" "current" {}