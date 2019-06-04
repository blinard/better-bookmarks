output "dbauthkey-secret-id" {
    value = "${azurerm_key_vault_secret.dbauthkey.id}"
}

output "dbauthkey-secret-version" {
    value = "${azurerm_key_vault_secret.dbauthkey.version}"
}
