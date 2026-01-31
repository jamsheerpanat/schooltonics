# GitHub Actions Deployment Guide

This guide explains how to set up automatic deployment using GitHub Actions.

## Overview

The deployment workflow is triggered on every push to the `main` branch. it connects to your production server via SSH and executes the `infra/server/deploy.sh` script.

## Required GitHub Secrets

To make the workflow function, you must add the following secrets to your GitHub repository (**Settings > Secrets and variables > Actions**):

| Secret Key | Description | Example |
| :--- | :--- | :--- |
| `SSH_HOST` | The IP address or hostname of your server | `1.2.3.4` |
| `SSH_USER` | The SSH username (usually `root` or a user with docker privileges) | `ubuntu` |
| `SSH_KEY` | The private SSH key (RSA/Ed25519) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SSH_PORT` | The SSH port of your server | `22` |
| `DEPLOY_PATH` | The absolute path where the repo is cloned on the server | `/opt/octoschoolengine` |

## Security Best Practices

1. **Dedicated User**: Use a dedicated deployment user on the server rather than `root`.
2. **Key Rotation**: Regularly rotate the SSH keys used for deployment.
3. **Firewall**: Restrict SSH access to your server to known IP ranges if possible (though GitHub Actions IPs change frequently).

## Troubleshooting

1. **Permission Denied**: Ensure the public key corresponding to `SSH_KEY` is in the `~/.ssh/authorized_keys` file of the `SSH_USER` on the server.
2. **Docker Errors**: Ensure the `SSH_USER` is part of the `docker` group on the server.
3. **Path Issues**: Double-check `DEPLOY_PATH` exists and contains the cloned repository.
