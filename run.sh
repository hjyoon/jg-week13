#!/bin/sh

input_mode() {
    printf "Input enviroment, p ( = production ) || d ( = development ) || l ( = local ) : "
    read -r ans

    if [ -n "$ans" ]; then
        process_input_mode "$ans"
    fi
}

input_force_restart() {
    printf "Force restart all? (y/N): "
    read -r ans

    if [ -n "$ans" ]; then
        set_force_restart "$ans"
    fi
}

process_input_mode() {
    case "$1" in
    p)
        set_mode "production"
        ;;
    d)
        set_mode "dev"
        ;;
    l)
        set_mode "local"
        ;;
    esac
}

set_mode() {
    MODE=$1
}

set_force_restart() {
    FORCE_RESTART=$1
}

run_interactive() {
    input_mode
}

OPTIONS_SET=false

while getopts ':-:m:f' opt; do
    case "$opt" in
    m)
        OPTIONS_SET=true
        if [ "$(echo "$OPTARG" | cut -c 1)" = "-" ]; then
            print_err_missing_argument "$opt"
            exit 1
        fi
        set_mode "$OPTARG"
        ;;
    f)
        OPTIONS_SET=true
        set_force_restart "y"
        ;;
    -)
        OPTIONS_SET=true
        # handle_long_option "$OPTARG" "$opt"
        ;;
    \?)
        echo "$(basename "$0"): unrecognized option '-$OPTARG'."
        echo "Try '$(basename "$0") --help' for more information."
        # print_err_invalid_option "$OPTARG"
        exit 1
        ;;
    :)
        print_err_missing_argument "$OPTARG"
        exit 1
        ;;
    esac
done

if [ "$OPTIONS_SET" = false ]; then
    run_interactive
fi

if [ -z "$MODE" ]; then
    echo "$(basename "$0"): '-m' or '--mode' option is required."
    echo "Try '$(basename "$0") --help' for more information."
    # print_err_missing_option "--user"
    exit 1
fi

if [ "$OPTIONS_SET" = true ] && [ -z "$FORCE_RESTART" ]; then
    FORCE_RESTART="n"
fi

# From here, write your application script below.

APP_NAME="jg-week13"

cd "$(dirname "$0")" || exit

if ! which npm; then
    echo "Cannot run script: npm not installed."
    exit 1
fi

npm i

if ! which pm2; then
    npm i pm2 -g
fi

pm2 describe $APP_NAME >/dev/null
RUNNING=$?

if [ $RUNNING -eq 0 ]; then
    if [ -z "$FORCE_RESTART" ]; then
        input_force_restart
    fi
    if [ "$FORCE_RESTART" = "y" ]; then
        echo "Force restarting..."
        pm2 delete $APP_NAME
        pm2 start ecosystem.json --only $APP_NAME --env "$MODE"
    else
        echo "is already running, reloading..."
        pm2 reload ecosystem.json --only $APP_NAME --env "$MODE"
    fi
else
    echo "Starting for the first time..."
    pm2 start ecosystem.json --only $APP_NAME --env "$MODE"
fi

pm2 reset $APP_NAME

echo "Successfully done."
