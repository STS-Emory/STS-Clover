if [ "$#" -ne 3 ]; then
    echo "Illegal number of parameters";
    echo "Name ID TimeStamp";
    exit 0;
fi;

STRING=$1'\n\n'$2'\n\n'$3

echo $STRING | lpr -P LabelWriter-450-Turbo -o protrait -o PageSize=w57h32 -o page-left=25 -o page-right=25 -o page-top=25 -o page-bottom=25
