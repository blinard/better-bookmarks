provider "azurerm" {
  subscription_id = "${var.azure_subscription_id}"
  version = "~> 1.33.0"
}

provider "azuread" {
  alias = "azad"
  version = "~> 0.6.0"
}

resource "azurerm_resource_group" "rg" {
  name = "${var.azure_resource_group_name}"
  location = "${var.azure_region}"
}

resource "azurerm_storage_account" "storage" {
  name = "${var.azure_storage_name}"
  resource_group_name = "${azurerm_resource_group.rg.name}"
  location = "${azurerm_resource_group.rg.location}"
  account_tier = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_application_insights" "appinsights" {
  name = "${var.azure_app_insights_name}"
  location = "${azurerm_resource_group.rg.location}"
  resource_group_name = "${azurerm_resource_group.rg.name}"
  application_type = "Web"
# This hidden tag is part of how Application Insights is configured for an Azure function but it's not the only thing
# Until I can figure out the rest, I'm going to just do it by clicking the link in the portal :/
#   tags = {
#       "${format("hidden-link:%s/providers/Microsoft.Web/sites/%s", azurerm_resource_group.rg.id, var.azure_function_name)}" = "Resource"
#   }
}


resource "azurerm_app_service_plan" "asp" {
  name = "${var.azure_app_service_plan_name}"
  location = "${azurerm_resource_group.rg.location}"
  resource_group_name = "${azurerm_resource_group.rg.name}"
  kind = "FunctionApp"

  sku {
      tier = "Dynamic"
      size = "Y1"
  }
}

# Something needs to be set in the Azure Function so that Application Insights will collect the logs
# Think the AppInsights id or something needs set in the Function App
# Actually - it might be the App Service that it needs configured with
resource "azurerm_function_app" "func" {
  name = "${var.azure_function_name}"
  location = "${azurerm_resource_group.rg.location}"
  resource_group_name = "${azurerm_resource_group.rg.name}"
  app_service_plan_id = "${azurerm_app_service_plan.asp.id}"
  storage_connection_string = "${azurerm_storage_account.storage.primary_connection_string}"
  version = "~2"
  enable_builtin_logging = false

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME = "dotnet"
    FUNCTION_APP_EDIT_MODE = "readonly"
    APPINSIGNTS_INSTRUMENTATIONKEY = "${azurerm_application_insights.appinsights.instrumentation_key}"
    https_only = "true"
    DbAuthKey = "${format("@Microsoft.KeyVault(SecretUri=%s)", azurerm_key_vault_secret.dbauthkey.id)}"
  }

  identity {
      type = "SystemAssigned"
  }

  // Note: Need to clear all the allowed origins so Cors can be handled by the function code.
  site_config {
    cors {
      allowed_origins = []
    }
  }

  depends_on = ["azurerm_key_vault_secret.dbauthkey"]
}

resource "azurerm_key_vault" "kv" {
    name = "${var.azure_key_vault_name}"
    location = "${azurerm_resource_group.rg.location}"
    resource_group_name = "${azurerm_resource_group.rg.name}"
    tenant_id = "${data.azurerm_client_config.current.tenant_id}"

    sku_name = "standard"
}

resource "azurerm_key_vault_secret" "dbauthkey" {
    name = "DbAuthKey"
    value = "${data.azurerm_cosmosdb_account.bbdb.primary_master_key}"
    key_vault_id = "${azurerm_key_vault.kv.id}"

    depends_on = [
        "azurerm_key_vault_access_policy.tf",
    ]
}

resource "azurerm_key_vault_access_policy" "tf" {
  key_vault_id        = "${azurerm_key_vault.kv.id}"

  tenant_id = "${data.azurerm_client_config.current.tenant_id}"
  object_id = "${data.azurerm_client_config.current.client_id}"
  certificate_permissions = [
    "create", 
    "delete", 
    "get", 
    "list", 
    "update",            
  ]
  key_permissions = [
    "create",            
    "delete", 
    "get", 
    "list", 
    "update", 
  ]
  secret_permissions = [
    "delete", 
    "get", 
    "list", 
    "set",
    "purge",
  ]
}

resource "azurerm_key_vault_access_policy" "funcapp" {
  key_vault_id        = "${azurerm_key_vault.kv.id}"

  tenant_id = "${azurerm_function_app.func.identity[0].tenant_id}"
  object_id = "${azurerm_function_app.func.identity[0].principal_id}"
  
  certificate_permissions = [
    "get",
  ]
  key_permissions = [
    "get",
  ]
  secret_permissions = [
    "get",
  ]
}

resource "azurerm_key_vault_access_policy" "me" {
  key_vault_id        = "${azurerm_key_vault.kv.id}"

  tenant_id = "${data.azurerm_client_config.current.tenant_id}"
  object_id = "${data.azuread_user.me.id}"
  certificate_permissions = [
    "backup", 
    "create", 
    "delete", 
    "deleteissuers", 
    "get", 
    "getissuers", 
    "import", 
    "list", 
    "listissuers", 
    "managecontacts", 
    "manageissuers", 
    "purge", 
    "recover", 
    "restore", 
    "setissuers",
    "update",            
  ]
  key_permissions = [
    "backup", 
    "create",            
    "decrypt", 
    "delete", 
    "encrypt", 
    "get", 
    "import", 
    "list", 
    "purge", 
    "recover", 
    "restore", 
    "sign", 
    "unwrapKey", 
    "update", 
    "verify",
    "wrapKey",            
  ]
  secret_permissions = [
    "backup", 
    "delete", 
    "get", 
    "list", 
    "purge", 
    "recover", 
    "restore",
    "set",
  ]
}
