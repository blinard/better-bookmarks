provider "azurerm" {
  subscription_id = "${var.azure_subscription_id}"
  version = "~> 1.28"
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
  "version" = "~2"
  
  app_settings {
    "FUNCTIONS_WORKER_RUNTIME" = "dotnet"
    "FUNCTION_APP_EDIT_MODE" = "readonly"
    "APPINSIGNTS_INSTRUMENTATIONKEY" = "${azurerm_application_insights.appinsights.instrumentation_key}"
    "https_only" = "true"
  }
}

