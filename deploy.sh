docker buildx create --name dcsf
docker buildx use dcsf


docker buildx build --platform linux/arm/v7 -t akidev05/rhytm:linux --push --no-cache .