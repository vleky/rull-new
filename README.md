# Rull Wallet

![Build Status](https://img.shields.io/badge/build-success-green.svg)
![Version](https://img.shields.io/badge/version-7.0.1-blue.svg)

### Project Description

**Project Name:** Rull Wallet  
**Description:** Rull Wallet is a command-line application built on Node.js that allows users to interact with the CELO cryptocurrency through a user-friendly command-line interface (CLI). The application provides basic CELO wallet management functions, including wallet creation, fund transfer, balance checking, and transaction history. Special attention is given to data security and ease of use.

**GitHub:** [GitHub Repository](https://github.com/vleky/rull-wallet)

### Key Features

1. **Wallet Creation**
   - Allows users to create a new CELO wallet.
   - A private key and mnemonic phrase are automatically generated for recovery.
   - All data is saved in a local file, which is password-protected (if password protection is enabled).

2. **Sending CELO (via Private Key)**
   - Users can send CELO to another wallet by entering the sender’s private key and the recipient's address.
   - The amount and transaction details can be reviewed before confirming the transfer.

3. **Transaction History**
   - Provides users with access to the transaction history of their wallet.
   - Displays information about recent transactions, including date, amount, and status.

4. **Wallet Balance Check**
   - Users can check the current balance of their CELO wallet by entering the corresponding private key or mnemonic phrase.

5. **Sending CELO (via Mnemonic Phrase)**
   - Similar to sending via a private key but uses the mnemonic phrase for authorization.
   - Convenient for users who prefer to store only the mnemonic phrase instead of the private key.

6. **About the Author**
   - Information about the app’s author, their motivation, and the goals behind developing this project.
   - Contact details for feedback.

7. **Exit**
   - Exits the application and saves all data to the local disk.
   - If password protection is enabled, all data is encrypted before exiting.

8. **Enable/Disable Password Protection**
   - Allows the user to enable or disable password protection for all operations.
   - Enabling this feature provides additional security by encrypting the data.

**To install Node.js and npm on different operating systems, follow these steps:**

### 1. Installation on **Windows**

#### Method 1: Using the Official Installer
1. Go to the [official Node.js website](https://nodejs.org/en).
2. Click the button to download the current LTS version (recommended) or the latest version.
3. Run the downloaded installer and follow the installation instructions. Leave all settings as default.
4. After installation is complete, open the command prompt (e.g., PowerShell) and verify the installation by entering the following commands:
   ```bash
   node -v
   npm -v
   ```
   These commands should display the installed versions of Node.js and npm.

#### Method 2: Using the Chocolatey Package Manager
If you have [Chocolatey](https://chocolatey.org/) installed:
1. Open PowerShell with administrator rights.
2. Enter the following command:
   ```bash
   choco install nodejs-lts
   ```
3. After installation, verify the versions:
   ```bash
   node -v
   npm -v
   ```

### 2. Installation on **macOS**

#### Method 1: Using Homebrew
1. Ensure Homebrew is installed. If not, install it by following the instructions on the [official Homebrew website](https://brew.sh/).
2. Open the terminal and run the command:
   ```bash
   brew install node
   ```
3. After the installation is complete, verify the versions:
   ```bash
   node -v
   npm -v
   ```

#### Method 2: Using the Official Installer
1. Go to the [official Node.js website](https://nodejs.org/en).
2. Download and run the installer for macOS.
3. Follow the installation instructions.
4. Verify the installation by entering the following commands:
   ```bash
   node -v
   npm -v
   ```

### 3. Installation on **Linux**

#### Method 1: Via Package Manager (Ubuntu/Debian)
1. Open the terminal and update the package indexes:
   ```bash
   sudo apt update
   ```
2. Install Node.js and npm:
   ```bash
   sudo apt install nodejs npm
   ```
3. Verify the versions:
   ```bash
   node -v
   npm -v
   ```

#### Method 2: Using Node Version Manager (NVM)
NVM allows you to install and manage multiple versions of Node.js:
1. Download and install NVM:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
   ```
   Then reload the terminal or run:
   ```bash
   source ~/.bashrc
   ```
2. Install the latest LTS version of Node.js:
   ```bash
   nvm install --lts
   ```
3. Verify the versions:
   ```bash
   node -v
   npm -v
   ```

Now, Node.js and npm are installed on your computer and ready to use.

### Installation
1. **Cloning the Repository**
   - First, clone the repository from GitHub to your local machine:
     ```bash
     git clone https://github.com/vleky/rull-new
     ```

2. **Installing Dependencies**
   - Navigate to the project directory and install the required dependencies using `npm`:
     ```bash
     cd rull
     npm install
     ```

3. **Running the Application**
   - To start the application, use the command:
     ```bash
     npm start
     ```

### Potential Issues

1. **Network Connection Error**
   - If the application cannot connect to the CELO network, ensure that your internet connection is stable. If the problem persists, check your network configuration or VPN settings.

2. **Unknown Recipient Address**
   - If the recipient address is not validated when sending CELO, ensure that the address is entered correctly. All addresses in the CELO network should start with `0x` and contain 42 characters.

3. **Password Protection Issues**
   - If you cannot remember the password enabled for wallet protection, the application will be unable to decrypt your data. Make sure to securely store all passwords.

4. **Dependency Installation Errors**
   - If `npm install` fails, try running the command with administrator rights or ensure that you have the latest version of Node.js installed.

### Conclusion

Rull Wallet offers a convenient and secure way to manage your funds in the CELO network. The application is constantly being refined and improving its functionality. If you have suggestions or find a bug, please contact the author through the provided contact information in the "About the Author" section.
